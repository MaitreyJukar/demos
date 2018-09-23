/* globals _, $, window, geomFunctions */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtOperation = Backbone.Model.extend({
        "directive": null,
        "parameters": null,

        "sources": null,
        "anchors": null,
        "offspring": null,

        "relations": null,
        "unsettledRelationsOfMapping": null,
        "agents": null,
        "engine": null,

        "_unsettledPoint": null,
        "_unsettledShape": null,
        "_unsettledRelationships": null,
        "_predefinedShapepointsMap": null,
        "operationRelationType": null,
        "sourceMappingOfCurrentOperationRelations": null,

        "_anticipatedRelations": null,
        "startAt": null,

        //used for polygon
        "_aboutToFinish": null,

        "_finished": null,
        "hitShape": null,
        "newAgents": [],
        /*
        0: draw : draw something and keep repeating till user aborts one operation to break the chain
        1: connect: do something and done
        2: other: like select, deselect etc
        */
        "type": null,

        "initialize": function() {
            this.agents = [];
            this.relations = [];
            this.anchors = [];
            this.sources = [];
            this._aboutToFinish = false;
            this._unsettledRelationships = [];
            this.unsettledRelationsOfMapping = [];
            this._anticipatedRelations = [];
            this.newAgents = [];
            this._predefinedShapepointsMap = {};
            this._finished = false;
            this.hitShape = [];

            this.waitForUserMove = _.bind(function(event) {
                var canvasCoordinates, mousePosition,
                    isTouchDevice = MathUtilities.Components.Utils.Models.BrowserCheck.isMobile;
                this.engine.eventListenerCanvas.attachMouseMoveFunction(null);

                if (this.directive !== 'drawPoint') {
                    if (this.directive === 'drawPolygon') {
                        //Creates relations of operation one by one in order as all sources required by it exists....
                        this.handleCurrentOperationGuardianRelations();
                    }

                    if (MathUtilities.Tools.Dgt.Models.DgtOperation.isOperationWithMultipleRelations(this.directive) === false) {
                        //to create relation.....
                        this.createRelationForCurrentOperation(this.operationRelationType, null);
                    }

                    if (isTouchDevice) {
                        /*
                        since we are allowing tap and drag so while dragging or moving around the screen a new point is created hence
                        we need to create a temporary Point
                        */
                        canvasCoordinates = MathUtilities.Tools.Dgt.Models.DgtEngine.defaultPointPosition;
                    }
                    this.engine.createNewPoint(canvasCoordinates, true);
                } else {
                    if (isTouchDevice) {
                        canvasCoordinates = MathUtilities.Tools.Dgt.Models.DgtEngine.defaultPointPosition;
                    } else if (event && event.point) {
                        mousePosition = this.engine.eventListenerCanvas.getMousePos(this.engine.dgtUI.$el.find('#canvas-event-listener'), event);
                        canvasCoordinates = [mousePosition.x, mousePosition.y];
                    }
                    this.engine.createNewPoint(canvasCoordinates);
                }

                this.engine.eventListenerCanvas.attachMouseMoveFunction(this.engine.createPointMove);
            }, this);

            this._onPointSettle = _.bind(function _onPointSettle(point) {
                point.off('settled', this._onPointSettle);

                if (!this._finished) {
                    this.engine.scheduleMovingPointCreation();
                }

                if (this.directive === 'drawPoint') {
                    this._operationFinished();
                }

            }, this);

            //this function is called only for draw types of operations in which case unsettled point is involved
            this._onRelationSpouseAdded = _.bind(function _onRelationSpouseAdded(relation, newSpouse) {
                var DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                    DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                    matured, index, looper,
                    newPosition, lastPosition, adjusterFunc, entity, engine = this.engine,
                    mousePosition,
                    deltaX, deltaY, postDragDataObject;

                //return if polygon is not drawn completely or for any shape return until all points of shape are not added to the relation of interior
                if (!(relation.species === 'polygonInterior' && (this.directive === 'drawPolygon' &&
                        !this._aboutToFinish || this.directive !== 'drawPolygon' &&
                        relation.species === 'polygonInterior' && DgtOperation._interiorPointsMap[this.directive] !== relation.sources.length))) {
                    relation.off('spouseAdded', _onRelationSpouseAdded);

                    //only polygon relation will continue
                    matured = relation.isMature() && relation.allPointsSerene();

                    if (matured) {
                        this.acknowledgeRelationship(relation);
                        //relation settled
                        index = this._unsettledRelationships.indexOf(relation);
                        this._unsettledRelationships.splice(index, 1);

                        relation = null;

                        if (this._unsettledRelationships.length > 0 && this.directive !== 'drawPolygon') {
                            return;
                        }
                        /*For operation with multiple relation if next relation in sequence require the current relation sources to be matured...*/
                        if (this.agents.length > 1 && DgtOperation.isOperationWithMultipleRelations(this.directive) && this.directive !== 'drawPolygon') {
                            this.handleCurrentOperationGuardianRelations();
                        }
                    }

                    if (matured && this.directive === 'drawPolygon' && !this._aboutToFinish) {
                        relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                        relation.setOperation(this);
                        relation.init('segment', engine);
                        relation.on('spouseAdded', this._onRelationSpouseAdded);

                        //Adding last created point to the Polygon relationship ' + newSpouse
                        relation.addSpouse(newSpouse);

                        //drawing polygon continues with new points
                        this._unsettledRelationships.push(relation);

                        //after relation point settle is called it will be added to it there
                    } else if (matured && this._unsettledRelationships.length === 0) { //invoke _operationFinished after all unsettledRelationships are acknowledge
                        if (['drawEllipse', 'drawHyperbola'].indexOf(this.directive) > -1) {
                            //code for ellipse
                            for (looper in this.relations) {
                                //this is the only unique way to identify the third point
                                if (this.relations[looper].species === 'dilate') {
                                    entity = this.relations[looper].getSource(0);
                                    break;
                                }
                            }

                            engine.deselectAll();
                            engine._select(entity, true, null, null, ['forceOperationSelection']);

                            adjusterFunc = _.bind(function(e) {
                                if (this._incinerated) {
                                    engine.eventListenerCanvas.attachMouseMoveFunction(null);
                                    return;
                                }
                                mousePosition = engine.eventListenerCanvas.getMousePos(engine.dgtUI.$el.find('#canvas-event-listener'), e);
                                newPosition = [mousePosition.x, mousePosition.y];

                                if (!lastPosition) {
                                    lastPosition = newPosition;
                                    return;
                                }
                                deltaX = newPosition[0] - lastPosition[0];
                                deltaY = newPosition[1] - lastPosition[1];

                                postDragDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createPostDragDataObject();
                                postDragDataObject.equation = entity.equation;
                                postDragDataObject.deltaX = deltaX;
                                postDragDataObject.deltaY = deltaY;
                                postDragDataObject.position = newPosition;
                                postDragDataObject.forceDrawing = entity.TRAVEL_NORMAL;
                                entity.onPostDrag(postDragDataObject);

                                lastPosition[0] = newPosition[0];
                                lastPosition[1] = newPosition[1];
                            }, this);

                            //if not double click mode and not tablet mode
                            if (!(engine._undergoingOperation.parameters.isDoubleClickMode ||
                                    DgtOperation.isTouchDevice() || DgtEngine.isAccessible && MathUtilities.Tools.Dgt.Models.DgtUiModel.fromKeyEvent)) {

                                engine.eventListenerCanvas.attachMouseMoveFunction(adjusterFunc);

                                engine.unscheduleMovingPointCreation();

                                engine.eventListenerCanvas.stealNextMouseDown(_.bind(function(e) {
                                    mousePosition = engine.eventListenerCanvas.getMousePos(engine.dgtUI.$el.find('#canvas-event-listener'), e);
                                    newPosition = [mousePosition.x, mousePosition.y];

                                    if (!lastPosition) {
                                        lastPosition = newPosition;
                                    } else {
                                        deltaX = newPosition[0] - lastPosition[0];
                                        deltaY = newPosition[1] - lastPosition[1];

                                        postDragDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createPostDragDataObject();
                                        postDragDataObject.equation = entity.equation;
                                        postDragDataObject.deltaX = deltaX;
                                        postDragDataObject.deltaY = deltaY;
                                        postDragDataObject.position = newPosition;
                                        postDragDataObject.forceDrawing = entity.TRAVEL_FORCE;
                                        entity.onPostDrag(postDragDataObject);
                                    }
                                    entity.dragging = false;

                                    engine.eventListenerCanvas.attachMouseMoveFunction(null);
                                    this._operationFinished();
                                }, this));

                            } else {
                                if (this.directive === 'drawEllipse') {
                                    entity.creator._params.offset = 0.7; //offset
                                } else if (this.directive === 'drawHyperbola') {
                                    entity.creator._params.offset = 1.3; //offset
                                }
                                entity.findDerivedPointPosition();
                                this.parameters.isDoubleClickMode = false;
                                this._operationFinished();
                            }
                            //end of code for ellipse

                        } else {
                            this._operationFinished();
                        }
                    }
                }
            }, this);
        },

        "createRelationForCurrentOperation": function(operationRelationData, params) {
            var relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
            this._unsettledRelationships.push(relation);
            relation.setOperation(this);
            relation.init(operationRelationData, this.engine, params);
            relation.on('spouseAdded', this._onRelationSpouseAdded);
            if (MathUtilities.Tools.Dgt.Models.DgtOperation.isOperationWithMultipleRelations(this.directive)) {
                this.unsettledRelationsOfMapping.push(relation);
            }
            return relation;
        },

        "createPointOnObject": function(position) {
            var relation,
                spouse = this.hitShape[0],
                point = this._unsettledPoint,
                offspringData,
                previousOperationRelationType = this.operationRelationType,
                gridPosition;
            if (this.hitShape.length > 1) {
                this.operationRelationType = MathUtilities.Tools.Dgt.Models.DgtOperation.getRelationForOperation('drawIntersection');
            } else {
                this.operationRelationType = MathUtilities.Tools.Dgt.Models.DgtOperation.getRelationForOperation('drawPointOnObject');
            }
            if (this.engine.grid.isSnapToGridEnabled()) {
                position = this.engine.grid.getClosestCanvasPoint(position);
            }
            relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
            relation.setEngine(this.engine);
            relation.setOperation(this);
            if (this.engine.grid.isSnapToGridEnabled()) {
                position = this.engine.grid.getClosestCanvasPoint(position); // To get snapped point position.
            }
            if (this.hitShape.length > 1) {
                relation.init(this.operationRelationType, this.engine, {
                    "index": this.engine.indexForIntersection
                });
            } else {
                relation.init(this.operationRelationType, this.engine);
            }

            relation.sources.push(spouse);
            if (this.hitShape.length > 1) {
                relation.sources.push(this.hitShape[1]);
            }
            relation.updateRelationCode();

            point.creator = relation;
            offspringData = MathUtilities.Tools.Dgt.Models.DgtRelation.getShapeOffspringData(relation.species, relation.sources);
            point.setCreationMethod(offspringData.creationMethod);
            relation.offspring = point;
            spouse.involveInRelation(relation);
            if (this.hitShape.length > 1) {
                this.hitShape[1].involveInRelation(relation);
            } else {
                gridPosition = this.engine.grid._getGraphPointCoordinates(position);
                relation.saveOffsetOfPointOnObject(gridPosition);

                point.setLocusOfPoint();
            }
            this.operationRelationType = previousOperationRelationType;
            this.acknowledgeRelationship(relation);
        },

        "createTickMark": function() {
            var engine = this.engine,
                params = {},
                relation = new MathUtilities.Tools.Dgt.Models.DgtRelation(),
                relationSource,
                sources = this.parameters.sourcesId || engine.selected,
                sourceLength = sources.length,
                loopVar;
            this._unsettledRelationships.push(relation);
            relation.setOperation(this);
            delete this.parameters.sourcesId;
            if (this.directive === 'drawAngleMark') {
                params = engine.dgtUI.model.dgtPopUpView.model.valuesForNotation.angleMark;
            } else {
                params = this.parameters;
            }
            relation.init(this.operationRelationType, engine, params);
            for (loopVar = 0; loopVar < sourceLength; loopVar++) {
                if (this.operationRelationType === 'tickMark') {
                    relationSource = engine.getEntityFromId(sources[loopVar]);
                } else {
                    relationSource = sources[loopVar];
                }
                relation.addSpouse(relationSource);
            }

            if (relation.isMature()) {
                relation.offspring.setLocusOfNotation();
            }

            this.acknowledgeRelationship(relation);
        },

        "acknowledgeRelationship": function(relation, trialRelation) {
            this.relations.push(relation);
            this.engine.acknowledgeRelation(relation, trialRelation);
        },

        "setEngine": function(engine) {
            this.engine = engine;
        },

        "getUnsettledPoint": function() {
            return this._unsettledPoint;
        },

        "substitutePoint": function(newPoint) {
            var relation;

            //for BZ17215
            if (this.type === 'multioffspringConnect') {
                for (relation = 0; relation < this._unsettledRelationships.length; relation++) {
                    if (this._unsettledRelationships[relation].isPartOfThisRelation(newPoint)) {
                        return false;
                    }
                }
            }

            if (newPoint) {
                this._substitutePoint = newPoint;

            } else {
                if (this._substitutePoint) {
                    this._substitutePoint = null;
                }
            }
            return true;
        },
        "replaceAgent": function(newAgent) {
            if (this.directive === 'drawPoint') {
                return;
            }

            var relation, finishOperation, firstPoint, unsettledPoint, result,
                relationsOfOperation = MathUtilities.Tools.Dgt.Models.DgtOperation.operationWithMultipleRelationsMapping[this.operationRelationType],
                totalRelationsOfOperation = relationsOfOperation ? relationsOfOperation.length : 1,
                indexOfUnsettledPoint;

            if (this.directive === 'drawPolygon' && this.isInvolvedInOperation(newAgent)) {
                if (this.parameters.fill) {
                    if (this.agents.length < 4) { // last point i.e. 3 will be restless
                        this.abortAndReborn();
                        return;
                    }
                } else if (this.relations.length < 2) {
                    this.abortAndReborn();
                    return;
                }
                //at this point replace with first point of the first relationship

                firstPoint = this.agents[0];
                newAgent = firstPoint;

                finishOperation = true;
                this._aboutToFinish = true;
            } else {
                if (this.isInvolvedInOperation(newAgent)) {
                    this.abortAndReborn();
                    return;
                }
                if (this._unsettledRelationships.length > 0) {
                    for (relation = 0; relation < this._unsettledRelationships.length; relation++) {
                        if (this._unsettledRelationships[relation].isPartOfThisRelation(newAgent)) {

                            this.abortAndReborn();
                            return;
                        }
                    }
                }
            }

            unsettledPoint = this._unsettledPoint;

            //replacing a point with preexisting point causes the relation to settle. This causes _unsettledPoint variable to change
            indexOfUnsettledPoint = this.agents.indexOf(unsettledPoint);
            if (indexOfUnsettledPoint > -1) {
                this.agents.splice(indexOfUnsettledPoint, 1, newAgent);
                MathUtilities.Tools.Dgt.Models.DgtPoint.createPointCoordinate = newAgent.equation.getPoints()[0];
                this.engine.scheduleMovingPointCreation();
            }
            indexOfUnsettledPoint = this.newAgents.indexOf(unsettledPoint);
            if (indexOfUnsettledPoint > -1) {
                this.newAgents.splice(indexOfUnsettledPoint, 1);
            }

            for (relation = 0; relation < this._unsettledRelationships.length; relation++) {
                result = this._unsettledRelationships[relation].replacePoint(this._unsettledPoint, newAgent);
                if (result) {
                    //...... find an elegant way to do this
                    while (unsettledPoint._childrenRelationships.length > 0) {
                        relation = unsettledPoint._childrenRelationships[0];
                        relation.replacePoint(unsettledPoint, newAgent);
                    }

                }
            }

            //once the point is replaced... the settling code will cleanup for operation level

            //then we remove the agent
            //when we remove the agent...he realizes that so far this operation was the sole purpose of his existence...so he takes his leave

            //if point is replaced shapes need some time to get over  the change...so trigger rearrangement once more

            //and we hire the new agent

            if (!this._finished && (this.startAt !== totalRelationsOfOperation || this.directive === 'drawPolygon')) {
                this.engine.eventListenerCanvas.attachMouseMoveFunction(this.engine.createMovingPoint);
            }

            if (finishOperation) {
                this._operationFinished();
            }
        },

        "abortAndReborn": function() {
            var preAbortData = {
                "type": this.type,
                "directive": this.directive,
                "params": this.parameters,
                "engine": this.engine
            };
            this.abort();

            if (preAbortData.type === 'draw') {
                preAbortData.engine.perform(preAbortData.directive, preAbortData.params);
            }
        },

        "removeRedundantRelations": function(relations) {
            var loopVar, curSpecies, sources, count, sortFunc,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                newSources, settledRelations = this.engine.relationShips;

            sortFunc = function(a, b) {
                return DgtEngine.getFirstNumberFromString(a.id) < DgtEngine.getFirstNumberFromString(b.id) ? 1 : -1;
            };

            for (loopVar = 0; loopVar < relations.length; loopVar++) {
                curSpecies = relations[loopVar].species;
                newSources = relations[loopVar].sources.slice();
                switch (curSpecies) {
                    case 'segment':
                    case 'line':
                    case 'circleWithRadius':
                        //check sorting of sources.
                        newSources = newSources.sort(sortFunc);
                        for (count = 0; count < settledRelations.length; count++) {
                            if (settledRelations[count].species === curSpecies) {
                                sources = settledRelations[count].sources.slice();
                                sources = sources.sort(sortFunc);
                                if ($.param(sources) === $.param(newSources)) {
                                    relations[loopVar].incinerate();
                                    break;
                                }
                            }
                        }
                        break;
                    case 'circleWithPoints':
                    case 'ray':
                        for (count = 0; count < settledRelations.length; count++) {
                            if (settledRelations[count].species === curSpecies) {
                                sources = settledRelations[count].sources.slice();
                                if (sources[0].id === newSources[0].id && sources[1].id === newSources[1].id) {
                                    relations[loopVar].incinerate();
                                    break;
                                }
                            }
                        }
                        break;
                }
            }
        },
        "getUnsettledShape": function() {
            return this._unsettledShape;
        },

        "waitForUserMove": null,
        "waitForUserMouseDown": null,
        "isPartOfThisOperation": function(relation) {
            return this.relations.indexOf(relation) > -1 || this._unsettledRelationships.indexOf(relation) > -1;
        },
        "initiateOperation": function(directive, parameters) {
            var DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                DgtRelation = MathUtilities.Tools.Dgt.Models.DgtRelation,
                entityArray = [],
                sortFunc,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                loopVar, restoreKind,
                creationMethod, relationCount, sourceImage, drawings, count1, index, curEntity,
                sources, anchor, src, relation, i, j, connectOperationType, isTouchDevice, annotation,
                image, measurement, sourceCount, preSources, shapeObjects, len, params = {},
                operationType,
                entity, looper,
                annotationPoints, noOfPoints,
                pointCounter;

            this.directive = directive;
            this.parameters = parameters;
            this.type = DgtOperation.getOperationType(this.directive);
            this.operationRelationType = DgtOperation.getRelationForOperation(this.directive);

            if (this.type === 'draw' && this.directive !== 'drawTickMark' && this.directive !== 'drawAngleMark' || this.type === 'annotation') {
                DgtOperation.lastOperationData = {
                    "directive": directive,
                    "params": parameters
                };
            }

            this.type = DgtOperation.getOperationType(directive);

            i = 0;
            isTouchDevice = 'ontouchstart' in window;
            if (this.type === 'draw') {
                if (this.directive !== 'drawTickMark' && this.directive !== 'drawAngleMark') {
                    if (!isTouchDevice && this.directive === 'drawPoint' && !DgtEngine.isAccessible) {
                        //Binding waitForUserMove on grid graph mousemove
                        this.engine.eventListenerCanvas.attachMouseMoveFunction(this.waitForUserMove);

                    } else {
                        this.waitForUserMove();
                    }
                } else if (this.directive === 'drawAngleMark') {
                    preSources = this.parameters.sources;
                    sources = [];
                    sourceCount = preSources.length;
                    for (i = 0; i < sourceCount; i++) {

                        if (preSources[i].point.division) {
                            if (preSources[i].point.properties.binaryInvisibility === 1) {
                                preSources[i].point.changeObjectVisibility(true, preSources[i].point.USER);
                            }
                            sources.push(preSources[i].point);
                        } else {
                            if (preSources[i].type && preSources[i].type !== 'centerPoint') {
                                params.offset = preSources[i].offset;
                                operationType = 'pointOnObject';
                            } else {
                                params.index = 0;
                                operationType = 'intersection';
                            }

                            shapeObjects = preSources[i].pointOnShapes;
                            len = shapeObjects.length;

                            relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                            relation.setEngine(this.engine);
                            relation.init(operationType, this.engine, params);

                            for (j = 0; j < len; j++) {
                                relation.addSpouse(shapeObjects[j]);
                            }

                            if (relation.isMature()) {
                                sources.push(relation.offspring);
                            }
                            this.acknowledgeRelationship(relation);
                        }
                    }

                    delete this.parameters.sources;

                    relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                    relation.setEngine(this.engine);
                    relation.setOperation(this);
                    relation.init(this.operationRelationType, this.engine, parameters);

                    len = sources.length;

                    for (i = 0; i < len; i++) {
                        relation.addSpouse(sources[i]);
                    }
                    this.acknowledgeRelationship(relation);
                    this._operationFinished();

                } else {
                    this.createTickMark();
                    this._operationFinished();
                }
                return;

            }
            if (this.type === 'transform') {
                //anchor to many source
                anchor = this.engine.anchor;
                sources = this.engine.selected;

                sources = sources.slice();
                for (i = 0; i < sources.length; i++) {
                    src = sources[i];
                    relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                    relation.setEngine(this.engine);
                    relation.setOperation(this);
                    relation.init(this.operationRelationType, this.engine, parameters);
                    if (relation.species !== 'translate') {
                        relation.addSpouse(anchor);
                    }
                    relation.addSpouse(src);

                    if (relation.isMature()) {
                        if (relation.sources[0].equation.getDashArray().length > 0) {
                            relation.offspring.setProperty('strokeStyle', 1);
                            relation.offspring.setStayBelow(relation.offspring);
                        }
                        this.acknowledgeRelationship(relation, true);
                        if (this.directive !== 'reflect') {
                            relation.offspring.setGrowthPhase('embryo');
                        }
                    }
                }

            } else if (this.type === 'connect') {

                //all permutations, no anchors

                // Singular:: create single offspring through multiple sources...
                // Eg select three points... and connect arc...
                // Single Relation for multiple Sources...

                // OneToOne:: Single Source and Single Offspring OR Create single offspring for every single source...
                // Eg. Select single segment & construct perpendicular line...
                // Single Relation for every Source...

                // AllPermutations:: Connect all source points circularly...
                // Eg. Select multiple points ....and connect segment.....
                // Multiple Relations...

                // OneToMany:: Create relation between first and all other sources...
                // Eg. Select single line and multiple points .... and connect Parallel Lines...
                // Multiple Relations...

                sources = this.engine.selected.slice();

                sources = DgtOperation.getInputsInOrder(sources, DgtOperation._prerequisitesMap[this.directive]);
                if (this.directive === 'connectArcOnCircle' && sources[0].division === 'point') {
                    this._changeSourceToCircleForArcOnCircle(sources);
                }
                len = sources.length;
                for (i = 0; i < len; i++) {
                    connectOperationType = DgtOperation.getConnectOperationType(this.directive);
                    src = sources[i];
                    if (directive === 'terminalPoint') {
                        relationCount = src.getTerminalDwarfs().length;
                        for (j = 0; j < relationCount; j++) {
                            relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                            relation.setOperation(this);
                            relation.init(this.operationRelationType, this.engine);
                            src.getTerminalPointParams(relation, j);
                            relation.addSpouse(sources[i]);
                            if (relation.isMature()) {
                                this.acknowledgeRelationship(relation);
                            }
                        }
                        break;
                    }
                    if (connectOperationType !== 'oneToOne' && i + 1 >= len && directive !== 'constructInterior' && directive !== 'terminalPoint') {
                        break;
                    }

                    if (connectOperationType !== 'oneToMany') {
                        relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                        relation.setOperation(this);
                        relation.init(this.operationRelationType, this.engine);
                        if (directive === 'constructInterior') {
                            params = relation.getParams();
                            if (!params) {
                                params = {};
                            }
                            params.noOfSources = sources.length;
                        }
                        relation.addSpouse(sources[i]);
                        //offspring condition for construct interior because interior relations are mature on addition of one point.
                        if (relation.isMature() && relation.offspring) {
                            this.acknowledgeRelationship(relation);
                            continue;
                        }
                    }

                    if (connectOperationType !== 'oneToOne') {

                        for (j = i + 1; j < sources.length; j++) {

                            if (connectOperationType === 'oneToMany') {
                                relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                                relation.setOperation(this);
                                relation.init(this.operationRelationType, this.engine);
                                relation.addSpouse(sources[i]);
                            }

                            relation.addSpouse(sources[j]);

                            if (relation.isMature() && relation.offspring) {

                                this.acknowledgeRelationship(relation);

                                if (connectOperationType !== 'oneToMany') {
                                    break;
                                }
                            }

                        }
                    }

                    //only line type connections are made in all permutations
                    if (connectOperationType !== 'allPermutation') {
                        break;
                    }
                }

                //final permutation of line types first and last point
                if (connectOperationType === 'allPermutation' && sources.length > 2) {
                    relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                    relation.setOperation(this);
                    relation.init(this.operationRelationType, this.engine);
                    relation.addSpouse(sources[sources.length - 1]);
                    relation.addSpouse(sources[0]);
                    this.acknowledgeRelationship(relation);
                }

            } else if (this.type === 'multioffspringConnect') {
                sources = this.engine.selected.slice();

                sources = DgtOperation.getInputsInOrder(sources, DgtOperation._prerequisitesMap[this.directive]);

                creationMethod = DgtRelation.getCreationMethodForSources(sources, this.operationRelationType);

                relationCount = DgtOperation.getRelationCountForOperation(creationMethod);

                for (i = 0; i < relationCount; i++) {

                    relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                    relation.setOperation(this);
                    relation.init(this.operationRelationType, this.engine, {
                        "index": i
                    });
                    relation.addSpouse(sources[0]);
                    relation.addSpouse(sources[1]);

                    this.acknowledgeRelationship(relation);
                }

            } else if (this.type === 'measure') {
                if (this.directive === 'parameter') {
                    if (!DgtEngine.restoreKind) {
                        measurement = new MathUtilities.Tools.Dgt.Models.DgtMeasurement();
                        measurement.renderMeasurement(this.directive, this.engine, this.directive, parameters);
                    }
                    //to get it in newAgents of operationFinished.
                    this.recruitAgent(measurement);
                } else {
                    if (directive !== 'calculation') {
                        sources = this.engine.selected.slice();
                        sources = DgtOperation.getInputsInOrder(sources, DgtOperation._prerequisitesMap[this.directive]);
                        i = 0;
                        while (i < sources.length) {
                            relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                            relation.setOperation(this);
                            relation.init(this.operationRelationType, this.engine, parameters);

                            while (!relation.isMature() && i < sources.length) {
                                relation.addSpouse(sources[i]);
                                i++;
                            }
                            if (relation.isMature()) {
                                this.acknowledgeRelationship(relation);
                            }
                        }
                    } else if (directive === 'calculation') {
                        relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                        relation.setOperation(this);
                        relation.init(this.operationRelationType, this.engine, parameters);
                        sources = parameters.sources;
                        if (sources && sources.length > 0) {
                            while (i < sources.length) {
                                relation.addSpouse(sources[i]);
                                i++;
                            }

                        } else {
                            relation.addSpouse();
                        }

                        if (relation.isMature()) {
                            this.acknowledgeRelationship(relation);
                        }
                    }

                }

            } else if (this.type === 'annotation') {
                this.engine.dgtUI._updateCanvasCursor(directive);
                if (DgtEngine.restoreKind) {
                    restoreKind = DgtEngine.restoreKind;
                    DgtEngine.restoreKind = 0;
                }
                annotation = new MathUtilities.Tools.Dgt.Models.DgtAnnotation();
                this.engine.annotation = annotation;
                annotation.setThickness(directive);
                annotation.engine = this.engine;
                annotation.setProperties();
                if (restoreKind) {
                    DgtEngine.restoreKind = restoreKind;
                }
                annotation.createAnnotation();
                this.offspring = annotation;

            } else if (this.type === 'image') {
                image = new MathUtilities.Tools.Dgt.Models.DgtImage();
                image.initiateImage(this.engine, parameters.image);
                this.offspring = image;
            } else if (this.type === 'crop') {

                relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                relation.setEngine(this.engine);
                relation.setOperation(this);
                relation.init(this.operationRelationType, this.engine, parameters);

                sourceImage = this.engine.getEntityFromId(parameters.sourceImageId);
                relation.addSpouse(sourceImage);

                if (relation.isMature()) {
                    this.acknowledgeRelationship(relation);
                }

            } else if (this.type === 'text') {
                image = new MathUtilities.Tools.Dgt.Models.DgtImage();
                image.species = 'text';
                image.initiateImage(this.engine, 'data:image/png;base64,' + parameters.base64, [parameters.left, parameters.top, 0, 0]);

                image.text = parameters.editorText;
                this.offspring = image;
                image.setTransformationObject();
            } else if (this.type === 'mark') {

                sources = this.engine.selected;
                sources = DgtOperation.getInputsInOrder(sources, DgtOperation._prerequisitesMap[this.directive]);
                if (sources[0].division !== 'measurement') {
                    relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                    relation.setOperation(this);
                    relation.init(this.operationRelationType, this.engine, parameters);

                    while (!relation.isMature() && i < sources.length) {
                        relation.addSpouse(sources[i]);
                        i++;
                    }
                    if (relation.isMature()) {
                        this.acknowledgeRelationship(relation);
                    }
                } else if (sources[0].division === 'measurement') {
                    /*add measurement in active marking & when it will be used set newly created relation as its mentee relation*/
                    this.engine.updateActiveMarkings(sources[0]);
                }
                this.engine.compileDataForAnimation(directive, sources);
            } else if (this.type === 'iterate') {
                relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                relation.setOperation(this);
                relation.init(this.operationRelationType, this.engine, parameters);

                sources = parameters.map.preImage;

                for (looper in sources) {
                    entity = this.engine.getEntityFromId(sources[looper]);
                    if (entity) {
                        relation.addSpouse(entity);
                    }
                }

                this.acknowledgeRelationship(relation);

            } else if (this.type === 'copy') {
                this.engine.clipBoardData.pasteCounter = 0;
                this.engine.setPasteData(this.getcutCopyArray(this.engine.selected), 'copy');
            } else if (this.type === 'cut') {
                this.engine.clipBoardData.pasteCounter = 0;
                this.engine.setPasteData(this.getcutCopyArray(this.engine.selected), 'cut');
                this.engine.deleteSelectedItems();

            } else if (this.type === 'paste') {
                this.engine.currentPasteData = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(this.engine.clipBoardData.pasteData);
                drawings = this.engine.currentPasteData.engine.drawing;
                this.engine.clipBoardData.pasteCounter++;
                for (count1 in drawings) {
                    for (loopVar = 0; loopVar < drawings[count1].length; loopVar++) {
                        curEntity = drawings[count1][loopVar];
                        if (curEntity.division === 'annotation') {
                            annotationPoints = curEntity.equation.points;
                            noOfPoints = annotationPoints.length;
                            for (pointCounter = 0; pointCounter < noOfPoints; pointCounter++) {
                                if ($.isEmptyObject(annotationPoints[pointCounter])) {
                                    annotationPoints[pointCounter] = null;
                                }
                            }
                        }
                        if (count1 === 'relationShips') {
                            this.engine.changePropertiesWhilePaste(curEntity);
                        } else {
                            index = this.engine.currentPasteData.engine.toHide.indexOf(curEntity.id);
                            this.engine.changePropertiesWhilePaste(curEntity, drawings.relationShips);
                            if (index > -1) {
                                this.engine.currentPasteData.engine.toHide[index] = curEntity.id;
                            }
                        }
                    }
                }
                for (count1 in this.engine.currentPasteData.engine.markings) {
                    this.engine.changePropertiesWhilePaste(this.engine.currentPasteData.engine.markings[count1], drawings.relationShips);
                }

                DgtEngine.restoreKind = DgtEngine.ACTION_PASTE;
                this.engine.setData(this.engine.currentPasteData, true);
                DgtEngine.restoreKind = null;

                sortFunc = function(a, b) {
                    return DgtEngine.getFirstNumberFromString(a.properties.labelCount) < DgtEngine.getFirstNumberFromString(b.properties.labelCount) ? 1 : -1;
                };
                for (count1 in drawings) {
                    if (count1 !== 'relationShips') {
                        entityArray = drawings[count1].sort(sortFunc);
                    } else {
                        entityArray = drawings[count1];
                    }
                    for (loopVar = 0; loopVar < entityArray.length; loopVar++) {
                        curEntity = this.engine.getEntityFromId(entityArray[loopVar].id);

                        if (curEntity && curEntity.division !== 'iteration') {

                            if (curEntity.species === 'parameter') {
                                if (curEntity.properties.labelText.charAt(0) !== '$') {
                                    curEntity.properties.labelText = 't' + this.engine.parameterCount;
                                    this.engine.parameterCount++;
                                }
                                curEntity.setProperty('labelText', curEntity.properties.labelText);

                            } else if (curEntity.division === 'measurement' && curEntity.properties.labelType === 'original-name') {
                                curEntity.updateOriginalLabelText();
                            } else if (curEntity.assignLabel && curEntity.properties.labelType !== 'current-label') {
                                curEntity.assignLabel();
                            }
                            if (curEntity._childrenRelationships) {
                                for (i = 0; i < curEntity._childrenRelationships.length; i++) {
                                    if (curEntity._childrenRelationships[i].offspring.division === 'marking') {
                                        continue;
                                    }
                                    if (!DgtOperation.isAPredefinedShape(curEntity._childrenRelationships[i].species)) {
                                        curEntity._childrenRelationships[i].offspring.updateLabelText();
                                    }
                                }
                            }
                            if (!curEntity.creator) {
                                this.newAgents.push(curEntity);
                            }

                            if (curEntity.division === 'measurement' && curEntity.division !== 'iteration') {
                                curEntity.trigger('update-banner-label');
                            }
                        } else if (curEntity) {
                            for (i in curEntity._childrenRelationships) {
                                if (curEntity._childrenRelationships[i].species === 'measureIteration') {
                                    curEntity._childrenRelationships[i].offspring.trigger('update-iteration-table', curEntity.generateMeasurementObject(), true);
                                }
                            }
                        }
                    }
                }

                for (count1 in this.engine.currentPasteData.engine.toHide) { // Hide derived entities.
                    curEntity = this.engine.getEntityFromId(this.engine.currentPasteData.engine.toHide[count1]);
                    if (curEntity && curEntity.properties && curEntity.properties.binaryInvisibility === 0) {
                        if (this.engine.selected.indexOf(curEntity) !== -1) {
                            this.engine._select(curEntity);
                        }
                        curEntity.changeObjectVisibility(false, curEntity.USER);
                    }
                }
            }
            if (this.type !== 'annotation' && (this.type !== 'transform' || this.directive === 'reflect') && this.type !== 'iterate') {
                this._operationFinished();
            }
        },

        "getcutCopyArray": function(arr) {
            var cutCopyArray = [],
                looper;
            for (looper = 0; looper < arr.length; looper++) {
                if (!arr[looper].properties.locked) {
                    cutCopyArray.push(arr[looper]);
                }
            }
            return cutCopyArray;
        },

        "updateOperationParams": function(params) {
            var loopCtr, relation, noOfRelations = this.relations.length;
            this.parameters = params;
            for (loopCtr = 0; loopCtr < noOfRelations; loopCtr++) {
                relation = this.relations[loopCtr];
                relation.updateRelationParams(params);
            }
        },

        "revertCurrentOperation": function() {
            var relation, loopCtr,
                noOfRelations = this.relations.length;

            for (loopCtr = 0; loopCtr < noOfRelations; loopCtr++) {
                relation = this.relations[loopCtr];
                relation.incinerate();
            }
            this.abort();
        },

        "_changeSourceToCircleForArcOnCircle": function(sources) {
            var curCircle, i, loopVar;
            for (i = 0; i < sources[0]._childrenRelationships.length; i++) {
                if (sources[0]._childrenRelationships[i].offspring.species === 'circle') {
                    curCircle = sources[0]._childrenRelationships[i].offspring;
                    if (sources[1].creator && sources[1].creator.isPartOfThisRelation(curCircle)) {
                        if (sources[2].creator && sources[2].creator.isPartOfThisRelation(curCircle)) {
                            sources[0] = curCircle;
                        } else {
                            for (loopVar = 0; loopVar < sources[2]._childrenRelationships.length; loopVar++) {
                                if (sources[2]._childrenRelationships[loopVar].isPartOfThisRelation(curCircle) && curCircle.creator.sources[1] === sources[2]) {
                                    sources[0] = curCircle;
                                }
                            }
                        }
                    } else {
                        for (loopVar = 0; loopVar < sources[1]._childrenRelationships.length; loopVar++) {
                            if (sources[1]._childrenRelationships[loopVar].isPartOfThisRelation(curCircle) && curCircle.creator.sources[1] === sources[1] && sources[2].creator && sources[2].creator.isPartOfThisRelation(curCircle)) {
                                sources[0] = curCircle;
                            }
                        }
                    }
                }
            }
            return sources;
        },
        "decrementCounter": function(value) {
            MathUtilities.Tools.Dgt.Models.DgtEngine.naturalEntityCount.points -= value;
        },

        "abort": function(reason) {
            if (['pencilAnnotation', 'penAnnotation'].indexOf(this.directive) > -1 && reason !== 'redo') {
                this.engine.annotation.endAnnotation();
                this._operationFinished();

            } else {
                this.trigger('aborted', this, reason);
                if (this.agents.length > 0) {
                    this.decrementCounter(this.agents.length - 1);
                }
                if (['pencilAnnotation', 'penAnnotation'].indexOf(this.directive) > -1) {
                    this.engine.annotation.endAnnotation();
                }
                this._incinerate();
            }
        },

        "_incinerate": function() {
            if (this._incinerated) {
                return;
            }

            var dummyPoint = this.engine.dummyPoint,
                i = 0,
                prop, relation;

            this.engine.eventListenerCanvas.attachMouseMoveFunction(null);
            this.engine.eventListenerCanvas._mouseDownSteal = null;

            this._incinerated = true;

            for (i = 0; i < this.newAgents.length; i++) {
                this.newAgents[i].incinerate();
            }
            if (this._unsettledRelationships.length > 0) {
                while (this._unsettledRelationships.length > 0) {
                    relation = this._unsettledRelationships.pop();
                    if (relation) {
                        relation.incinerate();
                    }
                }
            }
            if (this.relations.length > 0) {

                while (this.relations.length > 0) {
                    relation = this.relations.pop();
                    if (relation) {
                        relation.incinerate();
                    }
                }
            }
            if (dummyPoint) {
                dummyPoint.trigger('incinerated', dummyPoint);
            }

            if (this._anticipatedRelations) {
                for (i = 0; i < this._anticipatedRelations.length; i++) {
                    this._anticipatedRelations[i].incinerate();
                }
            }

            for (prop in this) {
                delete this[prop];
            }
            this._incinerated = true;
        },

        "_operationFinished": function() {
            var i, DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                TIMER = 1000,
                undoData, redoData, division, agent, relation, currentData, offspring,
                mentorMarkings, curMarking, cnt,
                accessibilityView = this.engine.accessibilityView,
                isTouchDevice = 'ontouchstart' in window,
                entity;

            this.startAt = null;

            if (this._finished || this._incinerated) {
                //Operation already finished
                return;
            }

            if (this.directive === 'drawPolygon') {
                for (i = 0; i < this.relations.length; i++) {
                    if (this.relations[i].offspring.species === 'polygonInterior' && !isTouchDevice) {
                        this.relations[i].sources.pop(); //delete duplicate source (bug #20284)
                    }
                }
                _.delay(_.bind(function() {
                    accessibilityView.setMessageForAccDiv('entity-created', ['polygon']);
                }, this), TIMER / 2);
            } else {
                entity = this.relations[0] ? this.relations[0].offspring : null;
                if (entity) {
                    _.delay(_.bind(function() {
                        if (entity.division !== 'measurement') {
                            accessibilityView.setMessageForAccDiv('entity-created', [entity.species]);
                        }
                    }, this), TIMER / 2);
                }
            }
            this.relations.sort(function(a, b) {
                return Number(DgtEngine.getFirstNumberFromString(a.id)) > Number(DgtEngine.getFirstNumberFromString(b.id)) ? 1 : -1;
            }); //to sort relations according to id (removing String rel).
            if (this.type === 'multioffspringConnect' || this.type === 'connect' || this.type === 'draw') {
                if (this.type === 'multioffspringConnect') {
                    for (i = 0; i < this.relations.length; i++) {
                        if (!isNaN(this.relations[i].offspring.equation.getPoints()[0][0])) {
                            this.relations[i].offspring.assignLabel();
                        }
                    }
                } else {
                    for (i = 0; i < this.relations.length; i++) {
                        if (this.relations[i].offspring.division !== 'point') { // assignLabel is called from consumeId
                            this.relations[i].offspring.assignLabel();
                        }
                    }
                }
            }
            if (this.type === 'transform') {
                for (i = 0; i < this.relations.length; i++) {
                    this.relations[i].offspring.setGrowthPhase('normal');

                    /* While transforming we are not adding mentee relation to the marking as we may or mat not translate using marking
                       hence while operation is finished if the relation has got mentor markings then set that relation as mentee relation
                       of that marking.... */
                    mentorMarkings = this.relations[i].getMentorMarking();
                    if (mentorMarkings.length > 0) {
                        for (cnt = 0; cnt < mentorMarkings.length; cnt++) {
                            curMarking = mentorMarkings[cnt];
                            curMarking.setMenteeRelation(this.relations[i]);
                            curMarking.on('marking-updated', this.relations[i]._mentorMarkingUpdated);
                        }
                    }

                    this.relations[i].offspring.updateLabelText();
                }
            }
            if (this.type === 'annotation') {
                this.engine.dgtUI._updateCanvasCursor('selectCursor');
            }
            this._finished = true;
            this.trigger('finish', this);
            if (this.directive !== 'copy' && this.directive !== 'cut' && this.directive !== 'paste') {
                this.engine.deselectAll();
            }
            if (this.directive === 'drawPoint') {
                this.engine._select(this.agents[0]);
            } else if (this.directive === 'addText' || this.directive === 'addImage') {
                this.engine._select(this.offspring);
            } else if (this.directive === 'connectIntersection') {
                for (i = 0; i < this.relations.length; i++) {
                    if (!isNaN(this.relations[i].offspring.equation.getPoints()[0][0])) {
                        this.engine._select(this.relations[i].offspring);
                    }
                }
            } else if (this.operationRelationType === 'parameter') {
                this.engine._select(this.newAgents[0]);
            } else if (this.directive !== 'paste') {
                for (i = 0; i < this.relations.length; i++) {

                    offspring = this.relations[i].offspring;
                    if (offspring && offspring.division === 'marking' ||
                        DgtOperation.isAPredefinedShape(this.relations[i].species) && offspring.division === 'point' ||
                        (this.directive === 'drawPolygon' || DgtOperation.isAPredefinedShape(this.operationRelationType)) &&
                        this.parameters.stroke && this.parameters.fill && offspring.species === 'segment') {
                        continue;
                    }
                    if (this.relations[i].species === 'iterate' && this.relations[i].offspring.iterationType === 'numeric') {
                        this.engine._select(this.relations[i].offspring._childrenRelationships[0].offspring);
                    } else {
                        this.engine._select(this.relations[i].offspring);
                    }
                }
            }
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

            };
            redoData = {
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
            };
            if (DgtOperation.isAPredefinedShape(this.operationRelationType)) {
                _.delay(_.bind(function() {
                    accessibilityView.setMessageForAccDiv('entity-created', [this.operationRelationType]);
                }, this), TIMER);
                this.surrenderLabel();
            }
            if (this.isATriangle()) {
                for (i = 0; i < this.relations.length; i++) {
                    if (this.relations[i].species === 'segment') {
                        this.assignOppositeLabel();
                    }
                }
            }
            for (agent in this.newAgents) {
                division = this.newAgents[agent].division;
                switch (division) {
                    case 'point':
                        currentData = this.newAgents[agent].getData();
                        this.newAgents[agent].redoData = currentData.equation;
                        currentData.redoData = currentData.properties;
                        redoData.engine.drawing.points.push(currentData);
                        undoData.engine.drawing.points.push(this.newAgents[agent].id);
                        break;

                    case 'shape':
                        currentData = this.newAgents[agent].getData();
                        this.newAgents[agent].redoData = currentData.equation;
                        currentData.redoData = currentData.properties;
                        redoData.engine.drawing.shapes.push(currentData);
                        undoData.engine.drawing.shapes.push(this.newAgents[agent].id);
                        break;

                    case 'measurement':
                        currentData = this.newAgents[agent].getData();
                        this.newAgents[agent].redoData = currentData.equation;
                        currentData.redoData = currentData.properties;
                        redoData.engine.drawing.measures.push(currentData);
                        undoData.engine.drawing.measures.push(this.newAgents[agent].id);
                        break;

                    case 'interior':
                        currentData = this.newAgents[agent].getData();
                        this.newAgents[agent].redoData = currentData.equation;
                        currentData.redoData = currentData.properties;
                        redoData.engine.drawing.interiors.push(currentData);
                        undoData.engine.drawing.interiors.push(this.newAgents[agent].id);
                        break;

                    case 'image':
                        currentData = this.newAgents[agent].getData();
                        this.newAgents[agent].redoData = currentData.equation;
                        currentData.redoData = currentData.properties;
                        redoData.engine.drawing.images.push(currentData);
                        undoData.engine.drawing.images.push(this.newAgents[agent].id);
                        break;

                    case 'annotation':
                        currentData = this.newAgents[agent].getData();
                        this.newAgents[agent].redoData = currentData.equation;
                        currentData.redoData = currentData.properties;
                        redoData.engine.drawing.annotations.push(currentData);
                        undoData.engine.drawing.annotations.push(this.newAgents[agent].id);
                        break;

                    case 'notation':
                        currentData = this.newAgents[agent].getData();
                        this.newAgents[agent].redoData = currentData.equation;
                        currentData.redoData = currentData.properties;
                        redoData.engine.drawing.notations.push(currentData);
                        undoData.engine.drawing.notations.push(this.newAgents[agent].id);
                        break;
                }
            }
            for (relation in this.relations) {
                division = this.relations[relation].offspring.division;
                if (['point', 'shape', 'iteration', 'measurement', 'marking', 'image', 'interior', 'notation'].indexOf(division) > -1) {
                    currentData = this.relations[relation].offspring.getData();
                    this.relations[relation].offspring.redoData = currentData.equation;
                    currentData.redoData = currentData.properties;
                }
                switch (division) {
                    case 'point':
                        if (undoData.engine.drawing.points.indexOf(this.relations[relation].offspring.id) === -1) {
                            // Don't push entity if it is already present (for POO case)
                            redoData.engine.drawing.points.push(currentData);
                            undoData.engine.drawing.points.push(this.relations[relation].offspring.id);
                        }
                        break;
                    case 'shape':
                        redoData.engine.drawing.shapes.push(currentData);
                        undoData.engine.drawing.shapes.push(this.relations[relation].offspring.id);
                        break;
                    case 'interior':
                        redoData.engine.drawing.interiors.push(currentData);
                        undoData.engine.drawing.interiors.push(this.relations[relation].offspring.id);
                        break;
                    case 'measurement':
                        redoData.engine.drawing.measures.push(currentData);
                        undoData.engine.drawing.measures.push(this.relations[relation].offspring.id);
                        break;
                    case 'marking':
                        redoData.engine.markings.push(currentData);
                        undoData.engine.markings.push(this.relations[relation].offspring.id);
                        break;
                    case 'image':
                        redoData.engine.drawing.images.push(currentData);
                        undoData.engine.drawing.images.push(this.relations[relation].offspring.id);
                        break;
                    case 'iteration':
                        redoData.engine.drawing.iterations.push(currentData);
                        undoData.engine.drawing.iterations.push(this.relations[relation].offspring.id);
                        offspring = this.relations[relation].offspring;
                        if (offspring._childrenRelationships.length > 0) {
                            redoData.engine.drawing.measures.push(offspring._childrenRelationships[0].offspring.getData());
                            undoData.engine.drawing.measures.push(offspring._childrenRelationships[0].offspring.id);
                            undoData.engine.drawing.relationShips.push(offspring._childrenRelationships[0].id);
                            redoData.engine.drawing.relationShips.push(offspring._childrenRelationships[0].getData());
                        }
                        offspring.hideUselessEntities();
                        break;
                    case 'notation':
                        redoData.engine.drawing.notations.push(currentData);
                        undoData.engine.drawing.notations.push(this.relations[relation].offspring.id);
                }
                undoData.engine.drawing.relationShips.push(this.relations[relation].id);
                redoData.engine.drawing.relationShips.push(this.relations[relation].getData());
            }
            if (['image', 'text'].indexOf(this.type) > -1) {
                redoData.engine.drawing.images.push(this.offspring.getData());
                undoData.engine.drawing.images.push(this.offspring.id);
            }
            if (this.type === 'annotation') {
                if (this.offspring.equation.getPoints().length !== 0) {
                    this.engine._select(this.offspring);
                    this.offspring.isFinished = true;
                    undoData.engine.drawing.annotations.push(this.offspring.id);
                    redoData.engine.drawing.annotations.push(this.offspring.getData());
                    this.engine.execute('drawable', {
                        "undo": {
                            "actionType": 'delete',
                            "undoData": undoData
                        },
                        "redo": {
                            "actionType": 'draw',
                            "redoData": redoData
                        }
                    });
                }
            } else if (this.type === 'crop') {
                this.engine.execute('cropping', {
                    "undo": {
                        "actionType": 'delete',
                        "undoData": undoData
                    },
                    "redo": {
                        "actionType": 'draw',
                        "redoData": redoData
                    }
                });
            } else if (this.type === 'draw' && ['drawTickMark', 'drawAngleMark'].indexOf(this.directive) > -1) {
                this.engine.execute('drawable', {
                    "undo": {
                        "actionType": 'delete',
                        "undoData": undoData
                    },
                    "redo": {
                        "actionType": 'draw',
                        "redoData": redoData
                    }
                });
            } else if (this.type !== 'cut' && this.type !== 'copy') {
                this.engine.execute('drawable', {
                    "undo": {
                        "actionType": 'delete',
                        "undoData": undoData
                    },
                    "redo": {
                        "actionType": 'draw',
                        "redoData": redoData
                    }
                });
            }
            if (this.engine._unsettledPoint) {
                this.engine._unsettledPoint.trigger('incinerated', this._unsettledPoint);
            }
            if (this.type === 'paste') {
                this.engine.updatePossibleOperations();
            }
            this.engine.incineratePurgatoryObjects();
            this.engine.grid.refreshView();
            if (this.directive !== 'drawTickMark' && this.directive !== 'drawAngleMark' && this.type === 'draw') {
                this.engine.perform(this.directive, this.parameters);
            } else if (['transform', 'measure', 'connect', 'parameter', 'calculation', 'mark', 'paste', 'copy', 'cut', 'iterate'].indexOf(this.type) > -1 || ['drawTickMark', 'drawAngleMark'].indexOf(this.directive) > -1) {
                geomFunctions.traceConsole(this.type);
                this.engine.performPreviousOperation(0);
            }
            // Check for image is added because while pasting an image, we get the offspring in newAgents
            if (this.newAgents[0] && (this.directive === 'calculation' || this.directive === 'parameter' || this.newAgents[0].division === 'image')) {
                offspring = this.newAgents[0];
            } else {
                offspring = this.relations[0] && this.relations[0].offspring || this.offspring;
            }
            if (['draw', 'annotation'].indexOf(this.type) === -1 && (!this.engine._undergoingOperation || this.engine._undergoingOperation === this) && offspring) {
                _.delay(_.bind(function() { //delay is used not to sense enter on canvas.
                    if (!this.engine.dgtUI.model.dgtPopUpView.model.curPopupShown && offspring.properties && !offspring.properties.binaryInvisibility) {
                        accessibilityView.setFocusToCanvas();
                        accessibilityView.hoverEntity(offspring);
                    }
                }, this), TIMER);
            }

        },
        "assignOppositeLabel": function() {
            var points = [],
                looper, segmentRelations = [],
                count, isLabelChanged = false,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                pointCount = DgtEngine.naturalEntityCount.points,
                lineCount = DgtEngine.naturalEntityCount.lineCount;
            for (looper in this.relations) {
                if (this.relations[looper].species === 'segment') {
                    segmentRelations.push(this.relations[looper]);
                    for (count in this.relations[looper].sources) {
                        if (points.indexOf(this.relations[looper].sources[count]) === -1) {
                            points.push(this.relations[looper].sources[count]);
                        }
                    }
                }
            }
            for (looper in segmentRelations) {
                for (count in points) {
                    if (segmentRelations[looper].sources.indexOf(points[count]) === -1) {
                        segmentRelations[looper].offspring.setProperty('labelText', points[count].properties.labelText.toLowerCase());
                        segmentRelations[looper].offspring.properties.labelText = points[count].properties.labelText.toLowerCase();
                        isLabelChanged = true;
                    }
                }
            }
            if (isLabelChanged) {
                if (pointCount > lineCount) {
                    DgtEngine.naturalEntityCount.lineCount = DgtEngine.naturalEntityCount.points;
                } else {
                    DgtEngine.naturalEntityCount.points = DgtEngine.naturalEntityCount.lineCount;
                }
            }
        },
        "surrenderLabel": function() {

            var relationMapping, relationMappingLength, i, ctr, len, pointsMap, pointsMapLength, index,
                predefinedShape = true;

            relationMapping = MathUtilities.Tools.Dgt.Models.DgtOperation.operationWithMultipleRelationsMapping[this.operationRelationType];
            relationMappingLength = relationMapping.length;

            for (i = 0; i < relationMappingLength; i++) {

                if (typeof relationMapping[i].type === 'undefined' || relationMapping[i].type !== 'label') {
                    continue;
                }

                this.decrementCounter(this.newAgents.length);
                pointsMap = relationMapping[i].pointsMap;
                pointsMapLength = pointsMap.length;

                for (ctr = 0; ctr < pointsMapLength; ctr++) {
                    len = pointsMap[ctr].length;
                    index = parseInt(pointsMap[ctr].charAt(len - 1), 10);
                    if (len === 2) {
                        if (typeof this.newAgents[index] !== 'undefined') {
                            this.newAgents[index].assignLabel(predefinedShape);
                        }
                    } else {
                        if (typeof this.unsettledRelationsOfMapping[index].offspring !== 'undefined') {
                            this.unsettledRelationsOfMapping[index].offspring.assignLabel(predefinedShape);
                        }
                    }
                }
            }
        },

        "isATriangle": function() {
            if (['isoscelesTriangle', 'equilateralTriangle'].indexOf(this.operationRelationType) > -1) {
                return true;
            }
            if (this.directive === 'drawPolygon') {
                var segments = [],
                    curEntity,
                    looper;
                for (looper in this.agents) {
                    curEntity = this.agents[looper];
                    if (curEntity.division === 'point' && segments.indexOf(curEntity) === -1) {
                        segments.push(curEntity);
                    }
                }
                for (looper in this.newAgents) {
                    curEntity = this.newAgents[looper];
                    if (curEntity.division === 'point' && segments.indexOf(curEntity) === -1) {
                        segments.push(curEntity);
                    }
                }
                return segments.length === 3; // sides of triangle.
            }
            return false;
        },

        "isInvolvedInOperation": function(entity) {
            return this.agents.indexOf(entity) > -1;
        },

        //To Check whether all sources of the relation exists or not..........
        "doesAllSourceExists": function(relationMapping) {

            if (relationMapping.requireSourceMapping === false) {
                return true;
            }

            var ctr, sourceString, relation, entity, sources = relationMapping.source,
                sourcesLength = sources.length;

            for (ctr = 0; ctr < sourcesLength; ctr++) {
                sourceString = sources[ctr];
                if (sourceString.length === 2 && this.agents !== null) {
                    entity = this.agents[parseInt(sourceString.charAt(1), 10)];
                } else if (sourceString.length === 3 && this.unsettledRelationsOfMapping.length > 0) {
                    relation = this.unsettledRelationsOfMapping[parseInt(sourceString.charAt(2), 10)];
                    if (typeof relation !== 'undefined') {
                        entity = relation.offspring;
                    }
                }

                if (typeof entity === 'undefined' || entity === null) {
                    break;
                }

                entity = null;
            }

            return ctr === sourcesLength;
        },

        // To create relation when all sources exists and push those sources in the relation..........
        "handleCurrentOperationGuardianRelations": function() {
            var ctr, count, relation, sourceEntity, require, source, sourceMapping, startAt,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                relationMapping = DgtOperation.operationWithMultipleRelationsMapping[this.operationRelationType],
                relationMappingLength = relationMapping.length,
                params = this.parameters;

            if (this.startAt === null) {
                startAt = 0;
            } else {
                startAt = this.startAt;
            }
            /* naturally u cant and shouldn't be able to make relations that are not from this start point...if you can then it either means you have all the relations
            settled or your requirements are messed up...at any given point there shouldn't be any relation that doesn't depend on its previous relation */
            for (ctr = startAt; ctr < relationMappingLength; ctr++) {

                /*for label type*/
                if (typeof relationMapping[ctr].type !== 'undefined' && relationMapping[ctr].type === 'label') {
                    continue;
                }

                require = relationMapping[ctr].params.require;

                if (typeof require === 'undefined' || params[require] && this.doesAllSourceExists(relationMapping[ctr])) {

                    if (relationMapping[ctr].needMatureSource) {
                        /* Returns if the relation to be created needs matured sources whose points are not yet serene.... */
                        sourceMapping = relationMapping[ctr].needMatureSource;
                        source = this.getSourceEntity(sourceMapping);
                        for (count in source) {
                            if (source[count]._stateOfMind === 'restless') {
                                this.startAt = ctr;
                                return;
                            }
                        }
                    }

                    relation = this.createRelationForCurrentOperation(relationMapping[ctr].specie, relationMapping[ctr].params);

                    if (this.directive !== 'drawPolygon') {

                        sourceEntity = this.getSourceEntityFromRelationMapping(relationMapping[ctr]);

                        for (count = 0; count < sourceEntity.length; count++) {
                            relation.addSpouse(sourceEntity[count]);
                        }
                        if (relation.isMature() && relationMapping[ctr].objectVisibility === false) {
                            relation.offspring.changeObjectVisibility(false, relation.offspring.GUARDIAN);
                        }

                        if (relation.isMature() && relation.allPointsSerene()) {
                            this.acknowledgeRelationship(relation);
                            if ($.inArray(relation, this._unsettledRelationships) >= 0) {
                                this._unsettledRelationships.splice($.inArray(relation, this._unsettledRelationships), 1);
                            }
                        }
                    }
                }
            }
            this.startAt = ctr;
        },

        // To get the sources of the relation from its mapping......
        "getSourceEntityFromRelationMapping": function(relationMapping) {
            return this.getSourceEntity(relationMapping.source);
        },

        "getSourceEntity": function(sources) {
            var ctr, len, index, entity = [],
                sourcesLength = sources.length;
            for (ctr = 0; ctr < sourcesLength; ctr++) {
                len = sources[ctr].length;
                index = parseInt(sources[ctr].charAt(len - 1), 10);

                /*
                For agents length is 2 since labels are A0, A1
                for offspring length is 3 since labels r, Or0, Or1 etc
                */
                if (len === 2) {
                    entity.push(this.agents[index]);
                } else {
                    entity.push(this.unsettledRelationsOfMapping[index].offspring);
                }
            }

            return entity;
        },

        "recruitAgent": function(entity, bIsNewAgent) {

            if (this.directive === 'parameter') {
                this.newAgents.push(entity);
                return;
            }
            var isNewAgent = bIsNewAgent,
                unsettledRelationsLength,
                firstPoint, relation,
                tempRelation, i, DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                isTouchDevice = 'ontouchstart' in window;

            if (!this.directive) {
                //No directive given to operation...Nothing to do
                return;
            }

            if (this.isInvolvedInOperation(entity) && this.directive !== 'drawPolygon') {
                this.abortAndReborn();
            }
            if (this.agents.indexOf(entity) > -1) {
                //entity  already recruited for operation

                if (this.directive === 'drawPolygon') {
                    //polygon is closing

                    firstPoint = this.agents[0];
                    entity = firstPoint;
                    this._aboutToFinish = true;
                } else {
                    return;
                }
            }
            if (entity.division === 'point' && entity.getStateOfMind() === "restless") {
                if (entity.division === 'point') {
                    this._unsettledPoint = entity;
                } else {
                    this._unsettledShape = entity;
                }

                entity.on('settled', this._onPointSettle);
                //special polygon, no relations are accepted and this is second point of first relation
            }

            if (this.agents.indexOf(entity) === -1) {
                this.agents.push(entity);
            }

            //Handle multiple relations operation.....
            if (this.agents.length > 1 && DgtOperation.isOperationWithMultipleRelations(this.directive) && this.directive !== 'drawPolygon') {
                this.handleCurrentOperationGuardianRelations();
            }

            if (this._unsettledRelationships.length > 0 && !isTouchDevice) {
                for (i = 0; i < this._unsettledRelationships.length; i++) {
                    tempRelation = this._unsettledRelationships[i];
                    //Add Spouse for operation with single relation...
                    if (DgtOperation.isOperationWithMultipleRelations(this.directive) === false || this.directive === 'drawPolygon') {
                        tempRelation.addSpouse(entity);
                    }
                }
            }

            if (isNewAgent) {
                this.newAgents.push(entity);
            }

            unsettledRelationsLength = this._unsettledRelationships.length;
            if (unsettledRelationsLength > 0 && isTouchDevice) {
                //For Tablets adding spouse to current relation
                for (i = 0; i < unsettledRelationsLength; i++) {
                    relation = this._unsettledRelationships[i];
                    relation.addSpouse(entity);

                    if (entity.getStateOfMind() === 'serene') {
                        this._onRelationSpouseAdded(relation, entity);
                    }
                }
            }
        },

        "_onPointSettle": null,

        "_onRelationSpouseAdded": null,

        "removeEntity": function(entity) {
            var index = this.agents.indexOf(entity);
            if (index > -1) {
                this.agents.splice(index, 1);
                entity.liberateKarma(this);
            }
        },

        "toString": function() {
            return "Operation " + this.directive;
        }

    }, { //STATIC

        "lastOperationData": null,

        "getPrerequisiteForOperation": function(operation) {
            operation = null;
        },

        "_interiorPointsMap": {
            "drawPolygon": 3,
            "drawIsoscelesTriangle": 3,
            "drawEquilateralTriangle": 3,
            "drawRectangle": 4,
            "drawSquare": 4,
            "drawParallelogram": 4,
            "drawPentagon": 5,
            "drawHexagon": 6,
            "drawCircleWithPoints": 2,
            "drawEllipse": 3
        },

        "_prerequisitesMap": {
            "drawPoint": "",
            "drawLine": "",
            "drawSegment": "",
            "drawCircleWithPoints": "",
            "drawRay": "",
            "drawEllipse": "",
            "drawHyperbola": "",
            "drawParabola": "",
            "drawPolygon": "",
            "drawIsoscelesTrianglePolygon": "",
            "drawEquilateralTrianglePolygon": "",
            "drawRectanglePolygon": "",
            "drawSquarePolygon": "",
            "drawParallelogramPolygon": "",
            "drawPentagonPolygon": "",
            "drawIsoscelesTriangle": "",
            "drawEquilateralTriangle": "",
            "drawSquare": "",
            "drawRectangle": "",
            "drawParallelogram": "",
            "drawPentagon": "",
            "drawHexagon": "",
            "drawHexagonPolygon": "",
            "drawInterior": "",
            "drawPointOnObject": "",
            "drawIntersection": "",

            "connectLine": "_P+P",
            "connectSegment": "_P+P",
            "connectCircleWithPoints": "_PP",
            "connectcircleWithRadius": "_PSg,_PMl,_PMd", //reg ex does not obey these flags
            "connectRay": "_P+P",
            "connectEllipse": "_PPP",
            "connectHyperbola": "_PPP",
            "connectParabola": "_PP",
            "connectMidpoint": "_+Sg",
            "connectIntersection": "_LL,_LCr,_CrCr,_AA,_ACr,_LA,_RIn",
            "connectArcOnCircle": "_PPP,_CrPP",
            "connectArc": "_PPP",
            "connectPointOnObject": "_+S,_+L,_+In",
            //point on object commented for now

            "constructInterior": "_+P,_+Cr,_+E,_+A",
            "parallel": "_L+P", //reg ex does not obey these flags
            "perpendicular": "_L+P", //reg ex does not obey these flags
            "perpendicularBisector": "_Sg",
            "markCenter": "_P",
            "markMirror": "_L",

            "markAngle": "_PPP,_Mg,_RR,_SgSg,_RSg,_SgR,_C",
            "markRatio": "_SgSg,_Mr,_Md",
            "markVector": "_PP",
            "markDistance": "_Ml",
            "unmarkAll": "",
            "rotate": "P_+D",
            "translate": "_+D",
            "dilate": "P_+D",
            "reflect": "L_+D",
            "iterate": "",
            "iterateToDepth": "",
            "terminalPoint": "_Y",
            "angleBisector": "_PPP,_RR,_SgSg,_RSg,_SgR",
            "penAnnotation": "",
            "pencilAnnotation": "",
            "addImage": "",
            "addText": "",

            /*...... sort points, middle point acts as anchor*/
            //all measure operations
            "measureCoordinate": "_+P", //regex set manually
            "measureCoordinateDistance": "_PP",
            "measureLength": "_+Sg",
            "measureSlope": "_+L",
            "measureEquation": "_+L",
            "measurePointLineDistance": "_PL", //regex set manually

            "measureAngle": "_PPP,_SgSg,_RR,_RSg,_SgR,_C",
            "measureRadius": "_+Cr,_+Ic,_+Ia,_+A", //regex set manually
            "measureArea": "_+Cr,_+In", //regex set manually
            "measureCircumference": "_+Cr,_+Ic",
            "measurePerimeter": "_+In",
            "measureArcLength": "_+A,_+Ia",
            "measureArcAngle": "_+A,+Ia",
            "measureRatio": "_SgSg",
            "properties": "_+D",
            "lockObject": "_+O",
            "delete": "_+O",
            "changeColor": "_+O",
            "showAllHidden": "",
            "unlockAll": "",
            "unlock": "",
            "hideObjects": "_+O",
            "showHideLabels": "_+D",
            "cut": "_+O",
            "copy": "_+O",
            "paste": "",
            "parameter": "",
            ////DO NOT DELETE - Temp commented options
            "drawTickMark": "",
            "drawAngleMark": "",

            "calculator": "", //to open calculator
            "calculation": "" // to create calculation measurement
        },

        "_relationRequirementMap": {
            "line": "_PP",
            "segment": "_PP",
            "circleWithPoints": "_PP",
            "circleWithRadius": "_PSg,_PMl,_PMd",
            "ray": "_PP",
            "parabola": "_PP",
            "parabolaDirectrix": "_PP",
            "hyperbola": "_PPP",
            "arc": "_PPP",
            "arcOnCircle": "_PPP,_CrPP",
            "ellipse": "_PPP",
            "translate": "_D",
            "rotate": "P_D",
            "dilate": "P_D",
            "reflect": "L_D",

            "angleBisector": "_PPP,_RR,_SgSg,_RSg,_SgR",
            "parallel": "L_P",
            "perpendicular": "L_P",
            "perpendicularBisector": "_Sg",
            "isoscelesTriangle": "P_P",
            "equilateralTriangle": "P_P",
            "square": "P_P",
            "rectangle": "P_P",
            "parallelogram": "P_P",
            "hexagon": "P_P",
            "pentagon": "P_P",
            "midpoint": "_Sg",
            "intersection": "_LL,_LCr,_CrCr,_AA,_ACr,_LA,_RIn",
            //point on object commented for now
            "pointOnObject": "_S,_L,_In",
            "polygonInterior": "",
            "circleInterior": "_PP",
            "ellipseInterior": "_PPP",

            "constructInterior": "_+P,_Cr,_E,_A",
            //all measure relations
            "measureCoordinate": "_P",
            "measureCoordinateDistance": "_PP",
            "measureLength": "_Sg",
            "measureSlope": "_L",
            "measureEquation": "_L",
            "measurePointLineDistance": "_PL", //regex set manually
            "cropping": "_I",
            "measureAngle": "_PPP,_SgSg,_RR,_RSg,_SgR,_C",
            "measureRadius": "_Cr,_Ic,_Ia,_A", //regex set manually
            "measureArea": "_Cr,_In", //regex set manually
            "measureCircumference": "_Cr,_Ic",
            "measurePerimeter": "_+In",
            "measureArcLength": "_A,_Ia",
            "measureArcAngle": "_A,_Ia",
            "measureRatio": "_SgSg",
            "measureIteration": "_y",
            "terminalPoint": "_y",
            "markAngle": "_PPP,_Mg,_SgSg,_RR,_RSg,_SgR,_C",
            "markRatio": "_SgSg,_Mr,_Md",
            "markVector": "_PP",
            "markDistance": "_Ml",
            "tickMark": "_S,_L",
            "angleMark": "_PPP",
            "iterate": "_+D",
            "iterateToDepth": "_+D"

        },

        "operationWithMultipleRelationsMapping": {
            "polygon": [{
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "requireSourceMapping": false,
                "source": [],
                "objectVisibility": true
            }, {
                "specie": "polygonInterior",
                "params": {
                    "noOfSources": 3,
                    "require": "fill"
                },
                "requireSourceMapping": false,
                "source": [],
                "objectVisibility": true
            }],

            "isoscelesTriangle": [{
                "specie": "isoscelesTriangle",
                "params": {
                    "index": 0
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A1", "OR0"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR0", "A0"],
                "objectVisibility": true
            }, {
                "specie": "polygonInterior",
                "params": {
                    "noOfSources": 3,
                    "require": "fill"
                },
                "source": ["A0", "A1", "OR0"],
                "objectVisibility": true
            }, {
                "type": "label",
                "pointsMap": ["A0", "OR0", "A1"]
            }],

            "equilateralTriangle": [{
                "specie": "equilateralTriangle",
                "params": {
                    "index": 0
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A1", "OR0"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR0", "A0"],
                "objectVisibility": true
            }, {
                "specie": "polygonInterior",
                "params": {
                    "noOfSources": 3,
                    "require": "fill"
                },
                "source": ["A0", "A1", "OR0"],
                "objectVisibility": true
            }, {
                "type": "label",
                "pointsMap": ["A0", "OR0", "A1"]
            }],

            "rectangle": [{
                "specie": "rectangle",
                "params": {
                    "index": 0
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "rectangle",
                "params": {
                    "index": 1
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A0", "0R1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR1", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A1", "OR0"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR0", "A0"],
                "objectVisibility": true
            }, {
                "specie": "polygonInterior",
                "params": {
                    "noOfSources": 4,
                    "require": "fill"
                },
                "source": ["A0", "OR1", "A1", "OR0"],
                "objectVisibility": true
            }, {
                "type": "label",
                "pointsMap": ["A0", "OR1", "A1", "OR0"]
            }],

            "square": [{
                "specie": "square",
                "params": {
                    "index": 0
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "square",
                "params": {
                    "index": 1
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A0", "0R1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR1", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A1", "OR0"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR0", "A0"],
                "objectVisibility": true
            }, {
                "specie": "polygonInterior",
                "params": {
                    "noOfSources": 4,
                    "require": "fill"
                },
                "source": ["A0", "OR1", "A1", "OR0"],
                "objectVisibility": true
            }, {
                "type": "label",
                "pointsMap": ["A0", "OR1", "A1", "OR0"]
            }],

            "parallelogram": [{
                "specie": "parallelogram",
                "params": {
                    "index": 0
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "parallelogram",
                "params": {
                    "index": 1
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A0", "0R1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR1", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A1", "OR0"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR0", "A0"],
                "objectVisibility": true
            }, {
                "specie": "polygonInterior",
                "params": {
                    "noOfSources": 4,
                    "require": "fill"
                },
                "source": ["A0", "OR1", "A1", "OR0"],
                "objectVisibility": true
            }, {
                "type": "label",
                "pointsMap": ["A0", "OR1", "A1", "OR0"]
            }],

            "pentagon": [{
                "specie": "pentagon",
                "params": {
                    "index": 0
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "pentagon",
                "params": {
                    "index": 1
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "pentagon",
                "params": {
                    "index": 2
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A0", "0R0"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A1", "OR1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR1", "OR2"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR2", "A0"],
                "objectVisibility": true
            }, {
                "specie": "polygonInterior",
                "params": {
                    "noOfSources": 5,
                    "require": "fill"
                },
                "source": ["A0", "OR0", "A1", "OR1", "OR2", "A0"],
                "objectVisibility": true
            }, {
                "type": "label",
                "pointsMap": ["A0", "OR0", "A1", "OR1", "OR2"]
            }],

            "hexagon": [{
                "specie": "hexagon",
                "params": {
                    "index": 0
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "hexagon",
                "params": {
                    "index": 1
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "hexagon",
                "params": {
                    "index": 2
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "hexagon",
                "params": {
                    "index": 3
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A0", "0R0"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR0", "0R1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR1", "A1"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["A1", "OR2"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR2", "OR3"],
                "objectVisibility": true
            }, {
                "specie": "segment",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR3", "A0"],
                "objectVisibility": true
            }, {
                "specie": "polygonInterior",
                "params": {
                    "noOfSources": 6,
                    "require": "fill"
                },
                "source": ["A0", "OR0", "OR1", "A1", "OR2", "OR3"],
                "objectVisibility": true
            }, {
                "type": "label",
                "pointsMap": ["A0", "OR0", "OR1", "A1", "OR2", "OR3"]
            }],

            "circleWithPoints": [{
                "specie": "circleWithPoints",
                "params": {
                    "require": "stroke"
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "circleInterior",
                "params": {
                    "require": "fill",
                    "noOfSources": 2
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }],

            "ellipse": [{
                "specie": "segment",
                "params": {},
                "source": ["A0", "A1"],
                "objectVisibility": false
            }, {
                "specie": "pointOnObject",
                "params": {
                    "offset": 1
                },
                "source": ["OR0"],
                "objectVisibilty": true,
                "needMatureSource": ["A0", "A1"]
            }, {
                "specie": "dilate",
                "params": {
                    "ratio": -1
                },
                "source": ["A0", "OR1"],
                "objectVisibilty": true
            }, {
                "specie": "ellipse",
                "params": {
                    "require": "stroke"
                },
                "source": ["OR2", "OR1", "A1"],
                "objectVisibility": true
            }, {
                "specie": "ellipseInterior",
                "params": {
                    "noOfSources": 3,
                    "require": "fill"
                },
                "source": ["OR2", "OR1", "A1"],
                "objectVisibility": true
            }],

            "hyperbola": [{
                "specie": "line",
                "params": {},
                "source": ["A0", "A1"],
                "objectVisibility": false
            }, {
                "specie": "pointOnObject",
                "params": {
                    "offset": 1
                },
                "source": ["OR0"],
                "objectVisibilty": true,
                "needMatureSource": ["A0", "A1"]
            }, {
                "specie": "dilate",
                "params": {
                    "ratio": -1
                },
                "source": ["A0", "OR1"],
                "objectVisibilty": true
            }, {
                "specie": "hyperbola",
                "params": {},
                "source": ["OR2", "OR1", "A1"],
                "objectVisibility": true
            }],

            "parabola": [{
                "specie": "parabola",
                "params": {},
                "source": ["A0", "A1"],
                "objectVisibility": true
            }, {
                "specie": "parabolaDirectrix",
                "params": {
                    "ratio": -1,
                    "angle": 90
                },
                "source": ["A0", "A1"],
                "objectVisibility": true
            }]

        },

        "isOperationWithMultipleRelations": function(directive) {
            return ['drawPolygon', 'drawCircleWithPoints', 'drawParabola', 'drawEllipse', 'drawHyperbola', 'drawIsoscelesTriangle', 'drawEquilateralTriangle', 'drawRectangle', 'drawSquare', 'drawSquare', 'drawParallelogram', 'drawPentagon', 'drawHexagon'].indexOf(directive) > -1;
        },

        "isAnchoredRelation": function(relation) {
            return ['rotate', 'dilate', 'reflect'].indexOf(relation) > -1;
        },

        /*
        possible relations: line, ray, segment, circle1, circle2, parabola, hyperbola, ellipse, translate, dilate, reflect, rotate
        */

        "getRelationForOperation": function(directive) {
            var relation;
            switch (directive) {
                case 'drawPoint':
                    break;

                case 'drawLine':
                case 'connectLine':
                    relation = 'line';
                    break;

                case 'connectMidpoint':
                    relation = 'midpoint';
                    break;

                case 'drawIsoscelesTrianglePolygon':
                case 'drawEquilateralTrianglePolygon':
                case 'drawRectanglePolygon':
                case 'drawSquarePolygon':
                case 'drawParallelogramPolygon':
                case 'drawPentagonPolygon':
                case 'drawHexagonPolygon':
                case 'polygon':

                case 'drawSegment':
                case 'connectSegment':
                    relation = 'segment';
                    break;

                case 'drawIsoscelesTriangle':
                    relation = 'isoscelesTriangle';
                    break;

                case 'drawEquilateralTriangle':
                    relation = 'equilateralTriangle';
                    break;

                case 'drawRectangle':
                    relation = 'rectangle';
                    break;

                case 'drawSquare':
                    relation = 'square';
                    break;

                case 'drawParallelogram':
                    relation = 'parallelogram';
                    break;

                case 'drawPentagon':
                    relation = 'pentagon';
                    break;

                case 'drawHexagon':
                    relation = 'hexagon';
                    break;

                case 'drawPointOnObject':
                case 'connectPointOnObject':
                    relation = 'pointOnObject';
                    break;

                case 'drawIntersection':
                case 'connectIntersection':
                    relation = 'intersection';
                    break;

                case 'connectcircleWithRadius':
                    relation = 'circleWithRadius';
                    break;

                case 'connectBisector':
                    relation = 'bisector';
                    break;

                case 'connectCircleWithPoints':
                case 'drawCircleWithPoints':
                    relation = 'circleWithPoints';
                    break;

                case 'drawRay':
                case 'connectRay':
                    relation = 'ray';
                    break;

                case 'drawArc':
                case 'connectArc':
                    relation = 'arc';
                    break;
                case 'connectArcOnCircle':
                    relation = 'arcOnCircle';
                    break;
                case 'drawEllipse':
                case 'connectEllipse':
                    relation = 'ellipse';
                    break;

                case 'drawHyperbola':
                case 'connectHyperbola':
                    relation = 'hyperbola';
                    break;

                case 'drawParabola':
                case 'connectParabola':
                    relation = 'parabola';
                    break;

                case 'drawPolygon':
                    relation = 'polygon';
                    break;

                case 'constructInterior':
                    relation = 'constructInterior';
                    break;

                case 'calculation':
                case 'calculator':
                    relation = 'calculation';
                    break;
                case 'cropping':
                    relation = 'cropping';
                    break;
                case 'drawTickMark':
                    relation = 'tickMark';
                    break;
                case 'drawAngleMark':
                    relation = 'angleMark';
                    break;
                default:
                    /* parallelLine, perpendicularLine, rotate, translate, dilate, reflect, angleBisector
                    All measure relations, all marking relations
                    */
                    relation = directive;
                    break;
            }
            return relation;
        },
        //is called only for draw type interiors.
        "getRelationForInterior": function(directive) {
            var relation;
            switch (directive) {
                case 'drawCircleWithPoints':
                    relation = 'circleInterior';
                    break;
                case 'drawEllipse':
                    relation = 'ellipseInterior';
                    break;
                default:
                    relation = 'polygonInterior';
                    break;
            }
            return relation;

        },
        "isPolygonOperation": function(directive) {
            var regex = /polygon/i; // looking for directive containing word polygon
            return regex.test(directive);
        },

        "matchExpectationCode": function(codename, expectedCode, lookForAnchor) {
            var expectationResult = false,
                loopVar,
                allExpectedCodes = expectedCode ? expectedCode.split(',') : [expectedCode],
                matchEachExpectionString = function(expectedCode) {

                    if (expectedCode === '') {
                        return true;
                    }
                    if (!(codename && expectedCode)) {
                        return false;
                    }
                    var char, found, arrCodeName, arrExpected, countRegEx, infinityRepeatUsed, i,
                        DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                        count = 0,
                        repeatCount = 0,
                        codeNameSplitRegEx = /[A-Z][a-z]?|_|\+|[\d]/g; /*Matches expectation code*/

                    function removeAnchor(str) {
                        if (str) {
                            return str.substr(str.indexOf('_') + 1);
                        }
                        return str;
                    }

                    if (!lookForAnchor) {
                        codename = removeAnchor(codename);
                        expectedCode = removeAnchor(expectedCode);
                    }

                    arrCodeName = codename.match(codeNameSplitRegEx);
                    if (!arrCodeName) {
                        return void 0;
                    }
                    arrExpected = expectedCode.match(codeNameSplitRegEx);
                    countRegEx = /[\d\+]/; /*Searches digit or char `+`*/
                    if (!arrExpected) {
                        return true;
                    }

                    infinityRepeatUsed = true;
                    while (count < arrExpected.length || repeatCount > 0) {
                        if (repeatCount === 0) {
                            char = arrExpected[count];
                            if (countRegEx.test(char)) {
                                repeatCount = char === '+' ? Infinity : Number(char);
                                if (repeatCount === Infinity) {
                                    infinityRepeatUsed = false;
                                }
                                count++;
                                char = arrExpected[count];
                                count++;
                                if (count < arrExpected.length) {
                                    return false;
                                }
                                continue;
                            }
                        }

                        if (lookForAnchor && char === '_') {
                            arrCodeName.shift();
                            count++;
                            continue;
                        }

                        found = false;
                        if (arrCodeName.length === 0) {
                            break;
                        }
                        for (i = 0; i < arrCodeName.length; i++) {
                            if (DgtOperation.isOfType(arrCodeName[i], char)) {
                                found = true;
                                arrCodeName.splice(i, 1);
                                break;
                            }

                            if (arrCodeName[i] === '_') {
                                break;
                            }
                        }
                        if (!found) {
                            return false;
                        }

                        if (repeatCount > 0) {
                            repeatCount--;
                            if (repeatCount === Infinity) {
                                infinityRepeatUsed = true;
                            }
                            if (arrCodeName.length === 0) {
                                repeatCount = 0;
                            }
                        } else {
                            count++;
                        }
                    }

                    return count === arrExpected.length && arrCodeName.length === 0 && infinityRepeatUsed;
                };

            /*separate at , & match each expected string*/

            for (loopVar = 0; loopVar < allExpectedCodes.length; loopVar++) {
                expectationResult = matchEachExpectionString(allExpectedCodes[loopVar]);
                if (expectationResult) {
                    return expectationResult;
                }
            }
            return expectationResult;
        },

        "getInputsInOrder": function(input, expectation) {
            var output = [],
                inputToProcess = [],
                found, repeatCount, countRegEx, char, codeNameSplitRegEx, expectationCodes, i, j, possibleExpectations, loopVar, inputsNotRearranged,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation;

            /*get expectation acc to sources selected, eg. in case of angle bisector _PPP or _SgSg*/
            possibleExpectations = expectation.split(',');
            for (loopVar = 0; loopVar < possibleExpectations.length; loopVar++) {
                expectation = possibleExpectations[loopVar];
                inputsNotRearranged = false;
                output = [];
                inputToProcess = input.slice();

                expectation = expectation.substr(expectation.indexOf('_') + 1);
                repeatCount = 0;
                countRegEx = /[\d\+]/; /*Searches digit or char `+`*/

                codeNameSplitRegEx = /[A-Z][a-z]?|_|\+|[\d]/g; /*Matches expectation code*/

                expectationCodes = expectation.match(codeNameSplitRegEx);

                for (i = 0; i < expectationCodes.length; i++) {
                    char = expectationCodes[i];
                    if (countRegEx.test(char)) {
                        repeatCount = char === '+' ? Infinity : Number(char);
                        continue;
                    }
                    found = false;
                    for (j = 0; j < inputToProcess.length; j++) {
                        if (DgtOperation.isOfType(DgtOperation._drawableMapping[inputToProcess[j].species], expectationCodes[i])) {
                            output.push(inputToProcess.splice(j, 1)[0]);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        inputsNotRearranged = true;
                        break; //continue to check next possible expectation(s)
                    }
                    if (repeatCount > 0 && inputToProcess.length > 0) {
                        i--;
                        repeatCount--;
                    }

                }
                if (inputsNotRearranged === false) {
                    return output;
                }
            }
            return output;
        },

        "doesCodeBelongToClass": function(code, classCode) {
            if (code === classCode) {
                return true;
            }
        },

        "isSpecialPolygon": function(directive) {
            var regex = /draw[\w]+polygon/i; /*looks for draw polygon directive*/
            return regex.test(directive);
        },

        "getSpecieCode": function(specie) {
            return MathUtilities.Tools.Dgt.Models.DgtOperation._drawableMapping[specie];
        },

        "_drawableMapping": {
            "point": "P",
            "line": "L", //any type of line
            "ray": "R",
            "segment": "Sg",
            "circle": "Cr",
            "arc": "A",
            "parabola": "Pr",
            "circleWithPoints": "Cp",
            "circleWithRadius": "Cs",
            "circleWithMeasurement": "Cm",
            "hyperbola": "H",
            "ellipse": "E",
            "Interior": "In",
            "circleInterior": "Ic",
            "polygonInterior": "Ip",
            "ellipseInterior": "Ie",
            "arcSegmentInterior": "Ia",
            "annotation": "An",
            "shape": "S", //any shape including lines excluding points
            "drawable": "D", //any drawable including point,line or shape
            "measure": "M",
            "image": "I",
            "text": "T",
            "displayObject": "O",
            "measureLength": "Ml",
            "measureCoordinateDistance": "Md",
            "measureCoordinate": "Mc",
            "measurePointLineDistance": "Mi",
            "measureSlope": "Ms",
            "measureEquation": "Me",
            "measureCircumference": "Mf",
            "measureArcAngle": "Mq",
            "measureArcLength": "Mn",
            "measurePerimeter": "Mp",
            "measureAngle": "Mg",
            "measureRatio": "Mr",
            "measureRadius": "Mu",
            "measureArea": "Ma",
            "parameter": "Pm",
            "calculation": "Cl",
            //to understand why iteration gets Y you will need to read this comment
            "iteration": "Y",
            "tickMark": "V",
            "angleMark": "C"
        },

        "isOfType": function(specieCode, expectedCode) {
            //find a better way to do this
            var possible, regex,
                DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                map = DgtOperation._drawableMapping,
                linePossible = map.ray + map.segment + map.line,
                shapeCirclePossible = map.circle + map.circleWithPoints + map.circleWithRadius + map.circleWithMeasurement,
                arcPossible = map.arc,
                interiorPossible = map.circleInterior + map.ellipseInterior + map.polygonInterior + map.arcSegmentInterior,
                shapePossible = map.hyperbola + map.ellipse + map.parabola + shapeCirclePossible + arcPossible + interiorPossible + map.tickMark + map.angleMark,
                intersectable = map.circle + map.line,
                measurePossible = map.measure + map.measureLength + map.measureCoordinateDistance + map.measureAngle + map.measureRatio + map.parameter + map.calculation + map.measureRadius + map.measureArea + map.measureCoordinate + map.measurePointLineDistance + map.measureSlope + map.measureEquation + map.measureCircumference + map.measureArcAngle + map.measureArcLength + map.measurePerimeter,
                drawablePossible = shapePossible + linePossible + map.annotation + measurePossible + interiorPossible + arcPossible + map.image + map.point,
                displayObjectPossible = drawablePossible + map.text + map.iteration;

            switch (expectedCode) {
                case 'L':
                    possible = linePossible;
                    break;

                case 'Cr':
                    possible = shapeCirclePossible;
                    break;

                case 'D':
                    possible = drawablePossible;
                    break;

                case 'S':
                    possible = shapePossible;
                    break;

                case 'O':
                    possible = displayObjectPossible;
                    break;

                case 'X':
                    possible = intersectable;
                    break;

                case 'In':
                    possible = interiorPossible;
                    break;

                default:
                    return specieCode === expectedCode;
            }

            regex = new RegExp(specieCode + "([A-Z]|$)", "g"); /*Specie code can only be followed by capital letter*/
            regex.exec();
            return regex.test(possible);
        },

        "_drawableRegex": null,
        "_relationRegEx": null,

        "checkPrerequisites": function(directive, engine) {
            var DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                type = DgtOperation.getOperationType(directive),
                codeName, isTransform;

            codeName = engine.getSelectedCodeName(type);

            isTransform = DgtOperation.getOperationType(directive) === 'transform' && directive !== 'translate';

            return DgtOperation.matchExpectationCode(codeName, DgtOperation._prerequisitesMap[directive], isTransform);
        },

        "getConnectOperationType": function(type) {

            switch (type) {
                case 'connectCircleWithPoints':
                case 'angleBisector':
                case 'connectIntersection':
                case 'connectArcOnCircle':
                case 'connectArc':
                case 'constructInterior':
                    return 'singular';

                case 'connectCircleWithMeasurement':
                case 'perpendicular':
                case 'parallel':
                case 'connectcircleWithRadius':
                case 'terminalPoint':
                    return 'oneToMany';

                case 'connectMidpoint':
                case 'perpendicularBisector':
                case 'connectPointOnObject':

                    return 'oneToOne';

                default:
                    return 'allPermutation';
            }
        },

        "getOperationType": function(directive) {
            var type, markRegEx = /mark[\w]*/, // directive starting with word mark
                changePropertyRegEx = /change[\w]*/, // directive starting with word change
                drawRegex = /draw[\w]*/, // directive starting with word draw
                connectRegex = /connect[\w]*/, // directive starting with word connect
                measureRegEx = /measure[\w]*/; // directive starting with word measure

            //exceptions
            switch (directive) {
                case 'angleBisector':
                case 'parallel':
                case 'perpendicular':
                case 'constructInterior':
                case 'perpendicularBisector':
                case 'terminalPoint':
                    type = 'connect';
                    break;

                case 'connectIntersection':
                    //......find a better name
                    type = 'multioffspringConnect';
                    break;

                case 'penAnnotation':
                case 'pencilAnnotation':
                    type = 'annotation';
                    break;

                case 'addImage':
                    type = 'image';
                    break;
                case 'cropping':
                    type = 'crop';
                    break;
                case 'addText':
                    type = 'text';
                    break;
                case 'resetBoard':
                    type = 'resetBoard';
                    break;
                case 'showHideLabels':
                case 'hideObjects':
                case 'showAllHidden':
                case 'properties':
                case 'lockObject':
                    type = 'display';
                    break;
                case 'parameter':
                case 'calculation':
                case 'calculator':
                    type = 'measure';
                    break;
                case 'copy':
                    type = 'copy';
                    break;
                case 'cut':
                    type = 'cut';
                    break;
                case 'paste':
                    type = 'paste';
                    break;
                case 'delete':
                    type = 'delete';
                    break;
                case 'iterate':
                case 'iterateToDepth':
                    type = 'iterate';
                    break;

                default:
                    if (drawRegex.test(directive)) {
                        type = "draw";
                    } else if (connectRegex.test(directive)) {
                        type = "connect";
                    } else if (measureRegEx.test(directive)) {
                        type = "measure";
                    } else if (markRegEx.test(directive)) {
                        type = "mark";
                    } else if (changePropertyRegEx.test(directive)) {
                        type = "changeProperty";
                    } else {
                        type = "transform";
                    }
                    break;
            }
            return type;
        },

        "getCommonPointCoords": function(shape1, shape2) {
            if (!shape1 || !shape2 || shape1.species !== 'ray' && shape1.species !== 'segment' && shape1.species !== 'line' || shape2.species !== 'ray' && shape2.species !== 'segment' && shape2.species !== 'line') {
                return void 0;
            }

            var shape1Data = shape1.equation.getConstants(),
                shape2Data = shape2.equation.getConstants(),
                point1 = {
                    "x": shape1Data.x1,
                    "y": shape1Data.y1
                },
                point2 = {
                    "x": shape1Data.x2,
                    "y": shape1Data.y2
                },
                point3 = {
                    "x": shape2Data.x1,
                    "y": shape2Data.y1
                },
                point4 = {
                    "x": shape2Data.x2,
                    "y": shape2Data.y2
                },
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            if (shape1Data.x1 === shape2Data.x1 && shape1Data.y1 === shape2Data.y1 || DgtEngine.comparePointsWithThreshold(point1, point3) ||
                shape1Data.x1 === shape2Data.x2 && shape1Data.y1 === shape2Data.y2 || DgtEngine.comparePointsWithThreshold(point1, point4)) {
                return {
                    "x": shape1Data.x1,
                    "y": shape1Data.y1
                };
            }
            if (shape1Data.x2 === shape2Data.x1 && shape1Data.y2 === shape2Data.y1 || DgtEngine.comparePointsWithThreshold(point2, point3) ||
                shape1Data.x2 === shape2Data.x2 && shape1Data.y2 === shape2Data.y2 || DgtEngine.comparePointsWithThreshold(point2, point4)) {
                return {
                    "x": shape1Data.x2,
                    "y": shape1Data.y2
                };
            }
        },

        "getCommonSpouse": function(relation1, relation2) {
            if (!(relation1 && relation2)) {
                return void 0;
            }
            var common = [],
                count, i;
            if (relation1.getAnchor() && relation1.getAnchor() === relation2.getAnchor()) {
                common.push(relation1.getAnchor());
            }

            count = relation1.getSourceCount();
            for (i = 0; i < count; i++) {
                if (relation2.isPartOfThisRelation(relation1.getSource(i))) {
                    common.push(relation1.getSource(i));
                }
            }
            return common;
        },

        "getCommonRelations": function(sources) {
            var rel = [],
                wheel, hamster, wheel2, isPart = false,
                entity1 = sources[0],
                entity2 = sources[1];
            if (entity1.creator) {
                if (entity1.creator.isPartOfThisRelation(entity2)) {
                    rel.push(entity1.creator);
                } else {
                    if (entity1.creator) {
                        for (wheel in entity1.creator.sources) {
                            if ((entity1.engine.isChildOf(entity2, entity1.creator.sources[wheel]) || entity1.engine.isChildOf(entity1.creator.sources[wheel], entity2)) &&
                                entity1.creator.sources[wheel].creator) {
                                rel.push(entity1.creator.sources[wheel].creator);
                            }
                        }
                    }
                }
            }
            for (wheel in entity1._childrenRelationships) {
                if (entity1.engine.isChildOf(entity2, entity1._childrenRelationships[wheel].offspring)) {
                    rel.push(entity1._childrenRelationships[wheel]);
                }
            }
            if (entity1._childrenRelationships.length > 0) {
                for (wheel in entity1._childrenRelationships) {
                    hamster = entity1._childrenRelationships[wheel];
                    if (hamster.isPartOfThisRelation(entity2)) {
                        rel.push(hamster);
                    }
                }
            }

            if (entity1._menteeRelations.length > 0) {
                for (wheel in entity1._menteeRelations) {
                    hamster = entity1._menteeRelations[wheel];
                    if (hamster.isPartOfThisRelation(entity2)) {
                        rel.push(hamster);
                    }
                }
            }
            if (entity1.species === 'circle' && entity2.creator &&
                entity2.creator.sources.indexOf(entity1) > -1) {
                rel.push(entity1.creator);
            }
            if (sources[2]) {
                for (wheel = 2; wheel < sources.length; wheel++) {
                    for (wheel2 = 0; wheel2 < rel.length; wheel2++) {
                        isPart = false;
                        hamster = rel[wheel2].offspring;
                        if (rel[wheel2].isPartOfThisRelation(sources[wheel])) {
                            isPart = true;
                        } else if (hamster._childrenRelationships && hamster._childrenRelationships.length &&
                            sources[wheel] && hamster.engine.isChildOf(sources[wheel], hamster)) {
                            isPart = true;
                        }
                        if (!isPart) {
                            rel.splice(wheel2, 1);
                            wheel2--;
                        }
                    }
                }
            }
            return rel;
        },

        "isContinuousOperation": function(directive) {
            return MathUtilities.Tools.Dgt.Models.DgtOperation.getOperationType(directive) === 'draw';
        },

        "getRelationCountForOperation": function(directive) {
            switch (directive) {
                case 'isoscelesTriangle':
                case 'equilateralTriangle':
                    return 1;

                case 'square':
                case 'rectangle':
                case 'parallelogram':
                    return 2;

                case 'pentagon':
                    return 3;

                case 'hexagon':
                    return 4;

                case 'circleIntersection':
                    return 2;
                case 'lineCircleIntersection':
                    return 2;

                case 'ellipse':
                    return 4;

                default:
                    return 1;
            }
        },

        "isAPredefinedShape": function(relation) {
            return ['isoscelesTriangle', 'equilateralTriangle', 'square', 'rectangle', 'parallelogram', 'pentagon', 'hexagon'].indexOf(relation) > -1;
        },
        "isAClosedShape": function(relation) {
            return ['circleWithRadius', 'circleWithMeasurement', 'circleWithPoints', 'ellipse'].indexOf(relation) > -1;
        },
        "checkForExpectation": function(specie, expectation) {
            var DgtOperation = MathUtilities.Tools.Dgt.Models.DgtOperation,
                regex = DgtOperation._drawableRegex[expectation];
            if (regex) {
                return regex.test(DgtOperation._drawableMapping[specie]);
            }
            return false;
        },
        "isTouchDevice": function() {
            return 'ontouchstart' in window || window.navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints;
        }
    });
})(window.MathUtilities);
