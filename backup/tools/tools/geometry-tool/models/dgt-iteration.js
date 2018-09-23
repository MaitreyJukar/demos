/* globals _, $, window, geomFunctions   */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtIteration = MathUtilities.Tools.Dgt.Models.DgtDrawable.extend({

        "_currentDepth": null,

        //blueprints: these are the collection of sequence that is to be execute in order to create a new depth
        "_bluePrint": null,
        "_generations": null,
        "_firstMaps": null,
        "_entityMap": null,
        "_independentSources": null,
        "previewMode": null,
        "adamBlock": null,
        "tabulateValues": null,
        "iterationAcknowledged": null,
        "hasMeasurement": null,
        "nonPointImage": null,
        "measurementAvtars": null,
        "_idol": [],
        "toSameLocation": null,
        "iterationEntityCount": null,
        "points": null,
        "shapes": null,
        "notations": null,
        "images": null,
        "annotations": null,
        "measures": null,
        "interiors": null,
        "markings": null,
        "iterationType": null,
        "_childrenRelationships": null,
        "propertiesForOffspring": null,
        "uselessEntities": [],

        "initialize": function() {
            var iterationCount = MathUtilities.Tools.Dgt.Models.DgtEngine.entityCount.shapes,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            this.measurementAvtars = [];
            this.id = 'y' + iterationCount;
            this.adamBlock = {};
            this.previewMode = false;
            this.containsShape = false;
            this.containsPOB = false;
            this._generations = [];
            this.tabulateValues = true;
            this.specieCount = {};
            this._independentSources = [];
            this.toSameLocation = true;
            this._mapCount = 0;
            this.nonPointImage = false;
            this.hasMeasurement = false;
            this.points = [];
            this.shapes = [];
            this.notations = [];
            this.images = [];
            this.annotations = [];
            this.measures = [];
            this.interiors = [];
            this.markings = [];
            this._childrenRelationships = [];
            this.iterationType = 'numeric';
            this.properties = {
                "binaryInvisibility": 0

            };
            this.iterationEntityCount = {
                "points": 0,
                "shapes": 0,
                "measures": 0,
                "annotations": 0,
                "images": 0,
                "relationShips": 0,
                "markings": 0,
                "interiors": 0,
                "notations": 0
            };
            this._entityMap = {};
            this.species = 'iteration';
            DgtEngine.entityCount.shapes++;
            this.setSerialNumber();
            this.iterationAcknowledged = _.bind(function(relation) {
                var loopVar, curRelation, offspring = relation.offspring;
                if (offspring) {
                    for (loopVar in offspring._childrenRelationships) {
                        curRelation = offspring._childrenRelationships[loopVar];
                        if (this.engine.relationShips.indexOf(curRelation) === -1) {
                            this.engine.acknowledgeRelation(curRelation);
                        }
                    }
                }
                relation.off('iteration-acknowledged', this.iterationAcknowledged);
            }, this);
        },

        "getCreationMethod": function() {
            return 'default';
        },

        "init": function(species, engine) {
            this.engine = engine;
            this.division = species;
        },
        "setPreviewMode": function(flag) {
            this.previewMode = flag;
        },
        "isSelfMapped": function(id, block, parentBlock) {
            return parentBlock.avatarMap[id] && block.avatarMap[id] && parentBlock.avatarMap[id] === block.avatarMap[id];
        },
        "generateFirstMap": function() {
            var engine = this.engine,
                isRestore = false,
                params, getPossiblePreImages,
                preImageList, imageMaps, waitForEntity,
                entity, relation, foundNew, checkParent,
                traverseProgressMap, trail, generated, logBook,
                action, isFormerAChildOfLatter,
                waitingList = {},
                digIn,
                eeny, possiblePreImages, updateDataObject;

            params = this.creator.getParamValues();

            preImageList = params.map.preImage;
            imageMaps = MathUtilities.Tools.Dgt.Models.DgtEngine.cloneObject(params.map.maps);
            this._mapCount = imageMaps.length;
            this._firstMaps = imageMaps;

            isFormerAChildOfLatter = _.bind(function(possibleChild, possibleParent) {
                var looper, status;

                if (possibleChild.creator) {
                    if (possibleChild.creator.isPartOfThisRelation(possibleParent)) {
                        return true;
                    }
                    for (looper in possibleChild.creator.sources) {
                        status = isFormerAChildOfLatter(possibleChild.creator.sources[looper], possibleParent);
                        if (status) {
                            return status;
                        }
                    }
                    if (possibleChild.creator.anchor) {
                        status = isFormerAChildOfLatter(possibleChild.creator.anchor, possibleParent);
                    }

                    return status;

                } else {
                    return false;
                }
            }, this);
            for (eeny in preImageList) {
                entity = this.engine.getEntityFromId(preImageList[eeny]);
                if (entity.division !== 'measurement') {
                    this.iterationType = 'basic';
                    break;
                }
            }

            waitForEntity = _.bind(function(entity) {
                var looper, possibleParent;

                for (looper in preImageList) {
                    possibleParent = this.engine.getEntityFromId(preImageList[looper]);
                    if (possibleParent === entity || isFormerAChildOfLatter(entity, possibleParent)) {
                        return true;
                    }
                }
                return false;
            }, this);

            function waitFor(who, waitsFor) {
                if (!waitingList[waitsFor]) {
                    waitingList[waitsFor] = [];
                }
                if (waitingList[waitsFor].indexOf(who) === -1) {
                    waitingList[waitsFor].push(who);
                }
            }

            digIn = _.bind(function(entity) {
                var relation1, looper, meeny, source, sourceWord,
                    startAt = traverseProgressMap[entity.id];

                if (startAt >= entity._childrenRelationships.length || trail.indexOf(entity.id) > -1) {
                    return;
                }
                checkParent = _.bind(function(parent) {
                    if (generated.indexOf(parent.id) === -1) {
                        if (waitForEntity(parent)) {
                            waitFor(entity.id, parent.id);
                            return false;
                        }
                        if (preImageList.indexOf(parent.id) === -1) {
                            action = parent.id;
                            this._independentSources.push(parent.id);
                            logBook.push(action);
                            this._entityMap[parent.id] = this.engine.getEntityFromId(parent.id);
                            foundNew(parent.id);
                            this.describeAction(action);
                        }
                    }
                    return true;
                }, this);


                for (looper = startAt || 0; looper < entity._childrenRelationships.length; looper++) {

                    relation1 = entity._childrenRelationships[looper];
                    if (relation1._universe || ['angleMark', 'tickMark'].indexOf(relation1.species) > -1) {
                        continue;
                    }
                    sourceWord = null;
                    if (generated.indexOf(relation1.offspring.id) > -1) {
                        continue;
                    }
                    for (meeny in relation1.sources) {
                        source = relation1.sources[meeny];
                        sourceWord = (sourceWord ? sourceWord + ',' : '') + source.id;
                        if (!checkParent(source)) {
                            return;
                        }
                    }
                    if (relation1.anchor) {
                        source = relation1.anchor;
                        if (!checkParent(source)) {
                            return;
                        }
                        sourceWord = source.id + ',' + sourceWord;
                    }
                    if (!relation1.offspring || relation1.species === 'iterate') {
                        continue;
                    }

                    action = {
                        "type": 'relation',
                        "rel": relation1.species,
                        "sourceWord": sourceWord,
                        "params": MathUtilities.Tools.Dgt.Models.DgtEngine.cloneObject(relation1._getParamData()),
                        "offspring": relation1.offspring.id,
                        "offspringInvisibility": relation1.offspring.properties.binaryInvisibility,
                        "relId": relation1.id
                    };



                    possiblePreImages = getPossiblePreImages(relation1.offspring.id);
                    if (possiblePreImages) {
                        action.preImage = possiblePreImages;
                    }

                    logBook.push(action);
                    this.describeAction(action);
                    traverseProgressMap[entity.id] = looper;

                    this._entityMap[relation1.offspring.id] = relation1.offspring;
                    generated.push(relation1.offspring.id);

                    digIn(relation1.offspring);
                    foundNew(relation1.offspring.id);

                }

                trail.push(entity.id);
            }, this);

            foundNew = _.bind(function foundNew(foundWho) {
                var entity1, object;
                object = engine.getEntityFromId(foundWho);
                if (!object) {
                    return;
                }
                this.adamBlock.entityMap[foundWho] = object;
                this.adamBlock.avatarMap[foundWho] = object;
                if (object && object.division === 'measurement' && (object.creator && object.creator.sources.length > 0)) {
                    if (this.measurementAvtars.indexOf(object) === -1 && this._independentSources.indexOf(object.id) === -1) {
                        if (!this.isNumericIteration()) { // tabulateValues is disabled for numeric iteration
                            this.hasMeasurement = true;
                        }
                        this.measurementAvtars.push(object);
                    }

                }
                this.follow(object);
                if (object && object.getCreationMethod() === 'pointOnObject') {
                    this.containsPOB = true;
                }
                if (object && (object.division === 'shape' || object.division === 'interior')) {
                    this.containsShape = true;
                    params.containsShape = true;
                }
                if (generated.indexOf(foundWho) === -1) {
                    generated.push(foundWho);
                }

                if (!waitingList[foundWho] || waitingList[foundWho].length === 0) {
                    geomFunctions.traceConsole('No one is waiting for ' + foundWho);
                    return;
                }
                while (waitingList[foundWho].length > 0) {
                    entity1 = engine.getEntityFromId(waitingList[foundWho].pop());
                    digIn(entity1);
                }
            }, this);

            //prepare level 0
            this.buildLevel(0);
            this._currentDepth = params.depth;
            this.adamBlock = this._generations[0].blocks[0];
            getPossiblePreImages = _.bind(function(firstImage) {
                var prePossible, looper;

                for (looper in this.adamBlock.maps) {
                    if (this.adamBlock.maps[looper].backwardMap[firstImage]) {
                        if (!prePossible) {
                            prePossible = [];
                        }
                        prePossible.push({
                            "index": looper,
                            "id": this.adamBlock.maps[looper].backwardMap[firstImage]
                        });
                    }
                }
                return prePossible;
            }, this);


            if (!this._bluePrint) {
                trail = [];
                generated = [];
                logBook = [];
                traverseProgressMap = {};
                for (eeny in preImageList) {
                    entity = this.engine.getEntityFromId(preImageList[eeny]);
                    action = {
                        "type": 'pre',
                        "pre": entity.id
                    };

                    logBook.push(action);
                    this._entityMap[entity.id] = entity;
                    possiblePreImages = getPossiblePreImages(entity.id);
                    if (possiblePreImages) {
                        action.preImage = possiblePreImages;
                    }

                    foundNew(entity.id);
                    this.describeAction(action);
                    digIn(entity);
                }

                this._bluePrint = logBook;
            } else {
                isRestore = true;

                for (eeny in this._entityMap) {
                    this.adamBlock.entityMap[eeny] = this._entityMap[eeny];
                }
            }
            this.updateLevelVisibility();
            if (this.measurementAvtars && this.measurementAvtars.length > 0 && !isRestore) {
                relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();
                relation.setEngine(this.engine);
                if (this.propertiesForOffspring) {
                    relation.propertiesForOffspring = this.propertiesForOffspring;
                }
                relation.init('measureIteration', this.engine);
                relation.addSpouse(this);
                if (this.engine.iterations.indexOf(this) > -1) {
                    this.engine.acknowledgeRelation(relation);
                } else {
                    this.creator.on('iteration-acknowledged', this.iterationAcknowledged);
                }
            } else {
                if (this._childrenRelationships && this._childrenRelationships.length > 0) {
                    updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                }
                for (eeny in this._childrenRelationships) {
                    if (this._childrenRelationships[eeny].species === 'measureIteration') {
                        this._childrenRelationships[eeny].offspring.update(updateDataObject);
                    }
                }
            }

        },
        "isNumericIteration": function() {
            var preImage = this.creator.getParamValues().map.preImage,
                looper;
            for (looper in preImage) {
                if (this.engine.getEntityFromId(preImage[looper]).division !== 'measurement') {
                    return false;
                }
            }
            return true;
        },
        "readPossiblePreimagesToString": function(arr) {
            var str = '',
                looper;
            for (looper in arr) {
                str += arr[looper].index + '>>' + arr[looper].id;
            }
            return str;
        },

        "updateLevelVisibility": function() {
            var looper, blockIndex, generation, entityIndex, block, entity, levelVisible, params = this.creator.getParamValues(),
                maxDepth = 5,
                grid = this.engine.grid,
                newLevelCreated, sources, localWillUpdate = [],
                updateDataObject,
                traverseDepth = Math.max(this._generations.length, this._currentDepth + 1);
            if (traverseDepth > maxDepth) {
                traverseDepth = maxDepth;
            }

            grid.restrainViewRefreshByModule('iteration.LevelVisibility');

            for (looper = 1; looper < traverseDepth; looper++) {
                if (params.previewMode && looper > 2) {
                    grid.freeViewRefreshByModule('iteration.LevelVisibility');
                    return;
                }
                generation = this._generations[looper];

                if (params.finalIteration === true) {

                    if (params.previewMode && this._currentDepth >= 2) {
                        levelVisible = looper === 2;
                    } else {
                        levelVisible = looper === this._currentDepth;
                    }
                } else {
                    levelVisible = looper <= this._currentDepth;
                }

                if (!this._generations[looper]) {
                    newLevelCreated = true;
                    this.buildLevel(looper);
                    generation = this._generations[looper];
                }

                if (generation.visible === levelVisible) {
                    continue;
                }
                generation.visible = levelVisible;

                for (blockIndex = 0; blockIndex < generation.blocks.length; blockIndex++) {
                    block = generation.blocks[blockIndex];

                    for (entityIndex in block.entityMap) {
                        entity = block.entityMap[entityIndex];
                        if (entity._universe) {
                            entity.changeObjectVisibility(levelVisible, entity.ITERATION_DEPTH);
                        }

                    }

                }

            }
            grid.freeViewRefreshByModule('iteration.LevelVisibility');

            if (newLevelCreated || !this.allSources) {
                sources = this.getActualSources();
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                updateDataObject.genesis = this;
                updateDataObject.relocatedEntities = localWillUpdate;
                updateDataObject.forceDrawing = this.TRAVEL_TEST | this.TRAVEL_WARP;

                for (looper in sources) {
                    if (sources[looper].division === 'point') {
                        sources[looper].triggerRearrangement(updateDataObject);
                    } else if (sources[looper].division === 'measurement') {
                        sources[looper].update(updateDataObject);
                    }
                }
                this.allSources = sources;
                this.localWillUpdate = localWillUpdate;
            }
            if (!params.previewMode) {
                for (looper in this.allSources) {
                    this.creator.addSpouse(this.allSources[looper]);
                }
            }

        },

        "describeAction": function(action) {
            if (typeof action === 'string') {
                geomFunctions.traceConsole('itlog: found object ' + action);
            } else {
                switch (action.type) {
                    case 'pre':
                        geomFunctions.traceConsole('itlog: Found pre-image ' + action.pre);
                        break;

                    case 'relation':
                        geomFunctions.traceConsole('itlog: Create relation ' + action.rel + ' which creates offspring ' + action.offspring + ' sourceWord:' + action.sourceWord);
                        break;

                    default:
                        geomFunctions.traceConsole('itlog: unknown type ' + action.type);
                        geomFunctions.traceConsole(action);
                        break;
                }

            }

        },

        "getProtoMap": function() {
            return {
                "forwardMap": {},
                "backwardMap": {}
            };
        },

        "buildLevel": function(levelIndex) {
            var previousLevel = this._generations[levelIndex - 1],
                blockIndex, block, level,
                params = this.creator.getParamValues(),
                currentMap, looper, id,
                imageMaps = params.map.maps,
                mapIndex;

            if (this._generations[levelIndex]) {
                geomFunctions.traceConsole('Level ' + levelIndex + ' already built');
                return;
            }

            if (!previousLevel && levelIndex > 0) {
                geomFunctions.traceConsole('Cant create level in mid air...' + levelIndex);
                return;
            }

            level = this.getProtoLevel();
            level.depth = levelIndex;
            this._generations[levelIndex] = level;

            if (levelIndex === 0) {
                block = this.getProtoBlock();
                block.preImages = params.map.preImage;
                block.depth = 0;
                block.maps = [];
                for (looper in block.preImages) {
                    block.cast[block.preImages[looper]] = block.preImages[looper];
                }
                for (mapIndex in imageMaps) {
                    currentMap = this.getProtoMap();
                    block.maps.push(currentMap);
                    block.firstImages[mapIndex] = [];
                    for (looper in block.preImages) {
                        id = block.preImages[looper];
                        if (imageMaps[mapIndex][id]) {
                            currentMap.forwardMap[id] = imageMaps[mapIndex][id];
                            block.firstImages[mapIndex].push(imageMaps[mapIndex][id]);
                        }

                    }
                    currentMap.backwardMap = this.getReverseMap(currentMap.forwardMap);

                }

                level.blocks.push(block);
                block.level = level;
                for (looper in block.cast) {
                    block.avatarMap[looper] = this.engine.getEntityFromId(block.cast[looper]);
                }
            } else {

                for (blockIndex = 0; blockIndex < previousLevel.blocks.length; blockIndex++) {
                    block = previousLevel.blocks[blockIndex];
                    block.level = level;
                    this.createNextGeneration(block, levelIndex);
                }
            }
        },

        "getProtoLevel": function() {
            return {
                "blocks": [],
                "visible": true,
                "depth": null,
                "incinerate": function() {
                    var looper;
                    if (this._incinerated) {
                        return;
                    }
                    this._incinerated = true;
                    while (this.blocks.length > 0) {
                        looper = this.blocks.pop();
                        looper.incinerate();
                    }
                }

            };
        },


        "getProtoBlock": function() {
            return {
                "childBlocks": [],
                "level": null,
                "depth": null,
                "maps": [],
                "cast": {},
                "preImages": [],
                "firstImages": [],
                "relations": [],
                "entityMap": {},
                "avatarMap": {},
                "incinerate": function() {
                    var looper, mentor, len;
                    if (this._incinerated) {
                        return;
                    }
                    this._incinerated = true;
                    while (this.childBlocks.length > 0) {
                        looper = this.childBlocks.pop();
                        looper.incinerate();
                    }
                    while (this.relations.length > 0) {

                        looper = this.relations.pop();
                        if (looper.species === 'pointOnObject') {
                            mentor = looper._params.offset;
                            if (typeof mentor === 'object' && mentor._menteeRelations) {
                                len = mentor._menteeRelations.length;
                                mentor._menteeRelations.splice(0, len);
                            }
                        }
                        if (looper._universe) {
                            looper.incinerate();
                        }
                    }

                    for (looper in this.entityMap) {
                        if (this.entityMap[looper] && this.entityMap[looper]._universe) {
                            this.entityMap[looper].incinerate();
                        }
                        delete this.entityMap[looper];
                    }
                },
                "toString": function() {
                    return 'Block on Level:' + this.level;
                }
            };
        },

        "createNextGeneration": function(parentBlock) {
            if (parentBlock.childBlocks.length > 0) {
                geomFunctions.traceConsole('Next generation already exists for block ' + parentBlock);
                return;
            }
            var mapIndex, recipe,
                method, selfMappedRelation, commonRels,
                eeny, meeny, offspring, previousRestoreKind = null,
                entityMapWithOriginalCast, originalEntity,
                entity, currentCast, relation, sourceWordIDs, sourceId,
                source, presentPreImage, DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                engine = this.engine,
                looper,
                block,
                level, getSource,
                currentDepth = parentBlock.depth + 1,
                preImageMapIndex;

            level = this._generations[parentBlock.depth + 1];
            getSource = _.bind(function(firstLevelName) {
                var currentPreName = currentCast[firstLevelName],
                    ent;
                ent = this._entityMap[currentPreName];
                return ent;
            }, this);

            function prepareCast() {
                var looper, obj;
                for (looper in parentBlock.cast) {
                    obj = parentBlock.maps[mapIndex].forwardMap[parentBlock.cast[looper]];
                    if (obj) {
                        currentCast[looper] = obj;
                    }
                }
            }

            for (mapIndex = 0; mapIndex < this._mapCount; mapIndex++) {

                block = this.getProtoBlock();
                block.mapIndex = mapIndex;
                block.level = level;
                block.depth = currentDepth;


                for (meeny = 0; meeny < this._mapCount; meeny++) {
                    block.maps.push({});
                    block.maps[meeny].forwardMap = {};
                }
                level.blocks.push(block);
                recipe = this._bluePrint;
                currentCast = block.cast;
                //this cast differentiates between two blocks
                prepareCast();
                entityMapWithOriginalCast = block.avatarMap;
                parentBlock.childBlocks.push(block);
                if (DgtEngine.restoreKind) {
                    previousRestoreKind = DgtEngine.restoreKind;
                    DgtEngine.restoreKind = null;
                }
                for (eeny in recipe) {
                    method = recipe[eeny];

                    if (typeof method === 'string') {
                        geomFunctions.traceConsole('Steady point ' + method);
                        entity = engine.getEntityFromId(method);
                        entityMapWithOriginalCast[method] = entity;
                    } else {
                        switch (method.type) {
                            case 'pre':
                                geomFunctions.traceConsole('Found preimage ' + method.pre);
                                entity = getSource(method.pre);

                                if (!entity) {
                                    continue;
                                }
                                entityMapWithOriginalCast[method.pre] = entity;

                                if (method.preImage) {

                                    for (meeny in method.preImage) {
                                        presentPreImage = currentCast[method.preImage[meeny].id];
                                        preImageMapIndex = method.preImage[meeny].index;

                                        block.maps[preImageMapIndex].forwardMap[presentPreImage] = entity.id;
                                        if (!block.firstImages[preImageMapIndex]) {
                                            block.firstImages[preImageMapIndex] = [];
                                        }
                                        block.firstImages[preImageMapIndex].push(entity.id);
                                    }

                                }
                                break;

                            case 'relation':
                                geomFunctions.traceConsole('Create relation ' + method.rel + ' which creates offspring ' + method.offspring + ' sourceWord:' + method.sourceWord);

                                sourceWordIDs = method.sourceWord.split(',');

                                for (meeny in sourceWordIDs) {
                                    if (!this.isSelfMapped(sourceWordIDs[meeny], block, parentBlock)) {
                                        selfMappedRelation = false;
                                        break;
                                    }
                                    selfMappedRelation = true;
                                }
                                if (!selfMappedRelation) {
                                    relation = new MathUtilities.Tools.Dgt.Models.DgtRelation();

                                    relation.init(method.rel, engine, DgtEngine.cloneObject(method.params), this);
                                    originalEntity = this.engine.getEntityFromId(method.offspring);
                                    if (relation.species === 'pointOnObject') {
                                        method.params.offset = originalEntity;
                                    }
                                    // Adding calculation as mentor for numeric iterations...
                                    if (relation.species === 'calculation') {
                                        method.params.inputReferenceMentor = originalEntity;
                                        originalEntity._menteeRelations = originalEntity._menteeRelations || [];
                                        originalEntity._menteeRelations.push(relation);
                                    }
                                    relation._setParamData(DgtEngine.cloneObject(method.params));
                                    relation.propertiesForOffspring = {};
                                    if (typeof this.properties.color !== 'undefined' && this.properties.color !== null) {
                                        relation.propertiesForOffspring.color = this.properties.color;
                                    } else {
                                        relation.propertiesForOffspring.color = originalEntity.properties.color;
                                    }
                                    relation.propertiesForOffspring.strokeStyle = originalEntity.properties.strokeStyle;
                                    for (meeny in relation._params.objectIndexInInputReference) {
                                        if (relation.species === 'calculation') {
                                            if (block.avatarMap[relation._params.sources[meeny]]) {
                                                relation._params.inputReference[relation._params.objectIndexInInputReference[meeny]] = block.avatarMap[relation._params.sources[meeny]].id;
                                            }
                                        }
                                    }
                                    for (meeny in sourceWordIDs) {
                                        sourceId = sourceWordIDs[meeny];
                                        source = entityMapWithOriginalCast[sourceId];
                                        if (!source) {
                                            return;
                                        }
                                        if (relation.species === 'pointOnObject' && !this.toSameLocation) {
                                            relation._params.offset = DgtEngine.generateRandomNumber(source);

                                        }
                                        relation.addSpouse(source);
                                    }
                                    if (!relation.offspring) {
                                        relation.incinerate();
                                        return;
                                    }

                                    if (this.properties.binaryInvisibility > 0) {
                                        relation.offspring.changeObjectVisibility(false, relation.offspring.VISIBILITY_UNIVERSE);
                                    }
                                    commonRels = relation.checkForDottedOverlappedShapes(true);
                                    if (commonRels) {
                                        for (looper = 0; looper < commonRels.length; looper++) {
                                            if (commonRels[looper].species === relation.species && commonRels[looper] !== relation) {
                                                relation.offspring.changeObjectVisibility(false, this.ITERATION_OVERLAPPED);
                                                if (this.uselessEntities.indexOf(relation.offspring) === -1) {
                                                    this.uselessEntities.push(relation.offspring);
                                                }
                                            }
                                        }
                                    }
                                    if (relation.offspring.species === 'calculation') {
                                        relation.offspring.updateCalculationValue();
                                    }
                                    if (method.offspringInvisibility !== 0 && this.engine._undergoingOperation && this.engine._undergoingOperation.type !== 'paste') {
                                        relation.offspring.changeObjectVisibility(false, this.SOURCE_AVATAR_HIDDEN);
                                    }
                                    relation.offspring.changeObjectVisibility(!(relation.offspring.division === 'point' && this.containsShape && this.nonPointImage === true), this.ITERATION_POINTS);
                                    if (relation.offspring.setGrowthPhase) {
                                        relation.offspring.setGrowthPhase('dwarf');
                                    }
                                    offspring = relation.offspring;
                                } else {
                                    offspring = this.engine.getEntityFromId(method.offspring);
                                    relation = null;
                                }
                                if (method.preImage) {
                                    for (meeny in method.preImage) {
                                        presentPreImage = currentCast[method.preImage[meeny].id];
                                        preImageMapIndex = method.preImage[meeny].index;

                                        block.maps[preImageMapIndex].forwardMap[presentPreImage] = offspring.id;
                                        if (!block.firstImages[preImageMapIndex]) {
                                            block.firstImages[preImageMapIndex] = [];
                                        }
                                        block.firstImages[preImageMapIndex].push(offspring.id);
                                    }
                                }
                                this._entityMap[offspring.id] = offspring;

                                block.entityMap[offspring.id] = offspring;

                                entityMapWithOriginalCast[method.offspring] = offspring;
                                if (relation) {
                                    relation.offspring.birthdata = {
                                        "block": block,
                                        "depth": currentDepth,
                                        "originalEntityId": originalEntity.id
                                    };
                                }
                                if (!this.specieCount[offspring.species]) {
                                    this.specieCount[offspring.species] = 0;
                                }
                                this.specieCount[offspring.species]++;
                                if (relation) {
                                    block.relations.push(relation);
                                }
                                break;

                            default:
                                geomFunctions.traceConsole('unknown type ' + method.type);
                                geomFunctions.traceConsole(method);
                                break;

                        }
                    }
                }

            }
            if (previousRestoreKind) {
                DgtEngine.restoreKind = previousRestoreKind;
            }

        },

        "getEntityFromId": function(id) {
            return this._entityMap[id];
        },
        "clearSpecieCount": function() {
            var looper;
            for (looper in this.specieCount) {
                delete this.specieCount[looper];
            }
        },
        "getTerminalPointParams": function(relation, serialNumber) {
            var points = this.points, relation,
                terminalPoints = this.getTerminalDwarfs(), looper;
            relation._params = {"originalEntityId": terminalPoints[serialNumber].birthdata.originalEntityId};
        },

        "getTerminalDwarfs": function(){
            var looper, points = this.points, terminalPoints = [],
            depth = this._currentDepth > 5 ? 5 : this._currentDepth;
            for(looper = 0; looper < points.length; looper++) {
                if(points[looper].birthdata && points[looper].birthdata.depth === depth) {
                    terminalPoints.push(points[looper]);
                }
            }
            return terminalPoints;
        },

        "getTerminalPointForPreImage": function(preImageId) {
            var terminalPoints = this.getTerminalDwarfs(), looper;
            for(looper = 0; looper < terminalPoints.length; looper++) {
                if(terminalPoints[looper].birthdata.originalEntityId === preImageId) {
                    return terminalPoints[looper];
                }
            }
        },

        /**
        Level
          depth: depth of level
          Blocks: Array of all blocks
            Block : Every block represents a map
              |- depth:
              |- preImage : list of all pre images
            maps : list of all maps in this level
              |- map
                 |- forwardMap  : map from preImage to firstImage
                 |- backwardMap : map from firstImage to preimage
              |- relations : list of all relations that are created in this level
              |- entityMap : list of all entities, this where all the entities will be mapped
              |- firstImage : list of all firstImages
              |- castingMap : first thing that is prepared in the level, casting map holds the mapping of the pre images in blueprints to the pre images of this level

        **/


        "getMapForLevel": function(levelNumber, mapIndex) {
            var level = this._generations[levelNumber - 1];
            return this._generations[levelNumber - 1] ? level.blocks[mapIndex].map : void 0;
        },

        "getReverseMap": function(map) {
            var reverseMap = {},
                entity;
            for (entity in map) {
                reverseMap[map[entity]] = entity;
            }
            return reverseMap;
        },
        "isDuplicateFirstImage": function(map) {
            var looper1, tempArr = {};
            for (looper1 in map) {
                if (tempArr[map[looper1]]) {
                    return true;
                }
                tempArr[(map[looper1])] = 1;
            }
            return false;
        },
        "isOffspringCreated": function() {
            if (this.points && this.points[0] || this._childrenRelationships[0]) {
                return true;
            }
            return false;
        },

        "update": function(updateData) {

            var i, looper,
                params = this.creator.getParamValues(),
                offspring,
                newDepth = params.depth,
                localRelocated = [],
                updateDataObject,
                genesis = updateData.genesis,
                newPosition = updateData.newPosition,
                dx = updateData.dx,
                dy = updateData.dy,
                relocatedEntities = updateData.relocatedEntities,
                forceDrawing = updateData.forceDrawing,
                modifyAttributes = updateData.modifyAttributes,
                DgtObject = MathUtilities.Tools.Dgt.Models.DgtObject;

            if (!relocatedEntities) {
                relocatedEntities = [];
            }
            if (relocatedEntities.indexOf(this) > -1) {
                return;
            }
            relocatedEntities.push(this);

            updateDataObject = DgtObject.createUpdateData();
            updateDataObject.modifyAttributes = modifyAttributes;


            if (!(forceDrawing & this.TRAVEL_TEST)) {
                this.engine.grid.restrainViewRefreshByModule('iterationUpdate');

                if (params.forceRedraw === true) {
                    this.clearIteration();
                    this.generateFirstMap();
                } else {
                    if (newDepth !== this._currentDepth) {
                        this._currentDepth = newDepth;
                    }
                    this.updateLevelVisibility();
                    this.clearSpecieCount();
                    localRelocated.willUpdate = this.localWillUpdate;
                    updateDataObject.genesis = this;
                    updateDataObject.relocatedEntities = localRelocated;
                    for (looper in this.allSources) {
                        updateDataObject.forceDrawing = forceDrawing | this.TRAVEL_WARP;
                        if (this.allSources[looper].division === 'point') {
                            this.allSources[looper].triggerRearrangement(updateDataObject);
                        } else if (this.allSources[looper].division === 'measurement') {
                            this.allSources[looper].update(updateDataObject);
                        }

                    }
                }
                this.engine.grid.freeViewRefreshByModule('iterationUpdate');

            }

            updateDataObject.genesis = genesis;
            updateDataObject.caller = this;
            updateDataObject.newPosition = newPosition;
            updateDataObject.dx = dx;
            updateDataObject.dy = dy;
            updateDataObject.relocatedEntities = relocatedEntities;
            updateDataObject.forceDrawing = forceDrawing;

            for (i = 0; i < this._childrenRelationships.length; i++) {
                offspring = this._childrenRelationships[i].offspring;
                if (this._childrenRelationships[i].species === 'measureIteration') {
                    if (this.tabulateValues === false) {
                        offspring.changeObjectVisibility(false, this.ITERATION_POINTS);
                    } else {

                        if (offspring.properties.binaryInvisibility !== 0) {
                            offspring.set('isPositionSet', false);
                        }
                        offspring.changeObjectVisibility(true, this.ITERATION_POINTS);
                    }
                }
                this._childrenRelationships[i].moveRelatives(updateDataObject);
            }

        },

        "changeColor": function(color) {
            var looper, entity;
            for (looper in this._entityMap) {
                entity = this._entityMap[looper];
                if (!entity || !entity._universe) {
                    continue;
                }
                this.engine._updateDrawableColor(entity, color);
            }
        },

        "distributeUniverseVisibility": function(bVisible) {
            var looper, entity;
            for (looper in this._entityMap) {
                entity = this._entityMap[looper];
                if (!entity || !entity._universe) {
                    continue;
                }
                entity.changeObjectVisibility(bVisible, this.VISIBILITY_UNIVERSE);
            }
        },

        "distributeProperty": function(propertyName, propertyValue) {
            var looper, entity;
            if(propertyName === 'locked') {
                return;
            }
            for (looper in this._entityMap) {
                entity = this._entityMap[looper];
                if (!entity || !entity._universe) {
                    continue;
                }
                entity.setProperty(propertyName, propertyValue);
            }
        },

        "getActualSources": function() {
            var looper, ids, wheel, sources = [],
                entity;
            this.adamBlock = this._generations[0].blocks[0];
            ids = this.adamBlock.preImages.slice();

            for (looper in this._independentSources) {
                if (ids.indexOf(this._independentSources[looper]) === -1) {
                    ids.push(this._independentSources[looper]);
                }

            }

            for (looper in this.adamBlock.firstImages) {
                for (wheel in this.adamBlock.firstImages[looper]) {
                    if (ids.indexOf(this.adamBlock.firstImages[looper][wheel]) === -1) {
                        ids.push(this.adamBlock.firstImages[looper][wheel]);
                    }

                }
            }
            for (looper in ids) {
                sources.push(this.engine.getEntityFromId(ids[looper]));
            }
            for (looper in this.adamBlock.entityMap) {
                entity = this.engine.getEntityFromId(looper);
                if (entity.division === 'marking') {
                    continue;
                }
                if (sources.indexOf(entity) === -1) {
                    sources.push(entity);
                }
            }
            return sources;

        },
        "clearIteration": function() {
            var level;
            while (this._generations.length > 0) {
                level = this._generations.pop();
                level.incinerate();
            }
            this._bluePrint = null;
            delete this.allSources;
            delete this.localWillUpdate;
            while (this._firstMaps.length > 0) {
                this._firstMaps.pop();
            }
            this._entityMap = {};
            while (this._childrenRelationships.length > 0) {
                this._childrenRelationships[0].incinerate();
            }

            this.points = [];
            this.shapes = [];
            this.annotations = [];
            this.images = [];
            this.markings = [];
            this.interiors = [];
            this.notations = [];

            this.iterationEntityCount = {
                "points": 0,
                "shapes": 0,
                "measures": 0,
                "annotations": 0,
                "images": 0,
                "relationShips": 0,
                "markings": 0,
                "interiors": 0,
                "notations": 0
            };
        },
        "getData": function() {
            var shapeJSON = {
                    "id": null,
                    "adamArray": [],
                    "measurementAvtars": []
                },
                loopVar;
            shapeJSON.id = this.id;
            shapeJSON.creator = this.creator.id;
            shapeJSON.species = this.species;
            shapeJSON.division = this.division;
            shapeJSON.tabulateValues = this.tabulateValues;
            shapeJSON.nonPointImage = this.nonPointImage;
            shapeJSON.containsShape = this.containsShape;
            shapeJSON.serialNumber = this.serialNumber;

            for (loopVar in this.measurementAvtars) {
                shapeJSON.measurementAvtars.push(this.measurementAvtars[loopVar].id);
            }
            if (this._childrenRelationships.length > 0) {
                shapeJSON.propertiesForOffspring = this._childrenRelationships[0].offspring.properties;
            }
            for (loopVar in this.adamBlock.entityMap) {
                shapeJSON.adamArray.push(loopVar);
            }
            shapeJSON.properties = this.properties;
            shapeJSON.bluePrint = MathUtilities.Tools.Dgt.Models.DgtEngine.cloneObject(this._bluePrint);
            return shapeJSON;
        },

        "setData": function(shapeJson, engine) {
            var loopVar;
            MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind = 'save';
            this.init(shapeJson.species, engine);
            this.id = shapeJson.id;
            this.properties = shapeJson.properties;
            this.division = shapeJson.division;
            this._bluePrint = shapeJson.bluePrint;
            this.tabulateValues = shapeJson.tabulateValues;
            this.nonPointImage = shapeJson.nonPointImage;
            this.containsShape = shapeJson.containsShape;
            if (!isNaN(shapeJson.serialNumber)) {
                this.serialNumber = shapeJson.serialNumber;
            }
            this.propertiesForOffspring = shapeJson.propertiesForOffspring;
            for (loopVar in shapeJson.measurementAvtars) {
                this.measurementAvtars.push(this.engine.getEntityFromId(shapeJson.measurementAvtars[loopVar]));
            }
            for (loopVar in shapeJson.adamArray) {
                this._entityMap[shapeJson.adamArray[loopVar]] = this.engine.getEntityFromId(shapeJson.adamArray[loopVar]);
            }
            this.properties = shapeJson.properties;
            MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind = null;
            this.engine.acknowledgeEntity(this);
        },

        "incinerate": function() {
            var level;
            if (this._incinerated) {
                return;
            }
            this.unfollowAll();
            this._incinerated = true;
            while (this._generations.length > 0) {
                level = this._generations.pop();
                level.incinerate();
            }
            this._bluePrint = null;
            while (this._firstMaps.length > 0) {
                this._firstMaps.pop();
            }
            this._entityMap = {};
            while (this._childrenRelationships.length > 0) {
                this._childrenRelationships[0].incinerate();
            }

            this.creator.incinerate();
            this.trigger('incinerated', this);

        },

        "getAllEntitiesForPrison": function() {
            var looper, collection = [],
                entity;
            for (looper in this._entityMap) {
                if (this._entityMap[looper] && this._entityMap[looper]._universe) {
                    entity = this._entityMap[looper];
                } else {
                    //this is cause outside world will change without prior notice :-|
                    entity = this.engine.getEntityFromId(looper);
                }
                if (entity && !entity._incinerated) {
                    collection.push(entity);
                }
            }
            return collection;
        },
        "hideUselessEntities": function() {
            var looper;
            for (looper = 0; looper < this.uselessEntities.length; looper++) {
                this.uselessEntities[looper].changeObjectVisibility(false, this.ITERATION_OVERLAPPED);
            }
        },

        "getAllAvatar": function(entity, considerInvisible) {
            var block, avatarMap,
                looper, firstName, findAvatar,
                avatars = [];
            if (!this.isEntityAtBaseLevel(entity)) {
                if (entity._universe !== this) {
                    geomFunctions.traceConsole('Doesnt belong to this universe');
                    return void 0;
                }
                if (!entity.birthdata) {
                    geomFunctions.traceConsole('stranded entity');
                    return void 0;
                }
                block = entity.birthdata.block;
                avatarMap = block.avatarMap;
                for (looper in avatarMap) {
                    if (entity === avatarMap[looper]) {
                        firstName = looper;
                        break;
                    }

                }
            } else {
                firstName = entity.id;
            }

            findAvatar = _.bind(function(block, firstName) {
                var curEntity, wheel;
                if (block.depth > 0 && block.depth <= this._currentDepth) {
                    curEntity = block.avatarMap[firstName];
                }

                if (curEntity && avatars.indexOf(curEntity) === -1) {
                    avatars.push(curEntity);
                }
                for (wheel in block.childBlocks) {
                    findAvatar(block.childBlocks[wheel], firstName);
                }
            }, this);
            if (firstName) {
                for (looper in this._generations[0].blocks) {
                    findAvatar(this._generations[0].blocks[looper], firstName);
                }
            } else {
                geomFunctions.traceConsole('Avatar not found');
                return void 0;
            }
            return avatars;

        },
        "isEntityAtBaseLevel": function(entity) {
            var firstGen = this._generations[0],
                baseBlocks, loopVar;
            if (firstGen) {
                baseBlocks = firstGen.blocks;
            }
            if (baseBlocks.length > 0) {
                for (loopVar in baseBlocks) {
                    if (baseBlocks[loopVar].entityMap && baseBlocks[loopVar].entityMap[entity.id] !== null && typeof baseBlocks[loopVar].entityMap[entity.id] !== 'undefined') {
                        return true;
                    }
                }
            }
            return false;
        },

        "toString": function() {
            return 'Iteration:' + this.id;
        },
        "generateMeasurementObject": function() {

            var measureObject = {
                    "label": [],
                    "values": [
                        []
                    ],
                    "parameters": []
                },
                count, avtars = [],
                rows, cols, value,
                indexOfE, indexOfDot,
                DgtEngine, species;
            DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            if (this.measurementAvtars.length === 0) {
                return {};
            }
            measureObject.label.push('{n}');
            measureObject.values[0].push('0');
            for (count = 0; count < this.measurementAvtars.length; count++) {
                avtars.push([]);
                avtars[count] = this.getAllAvatar(this.measurementAvtars[count]);
                value = this.measurementAvtars[count].getDisplayedValueAsString();
                species = this.measurementAvtars[count].species;
                if (value === 'NaN') {
                    value = 'undefined';
                } else if (species !== 'measureCoordinate' && species !== 'measureEquation') {
                    indexOfDot = value.indexOf('.');
                    indexOfE = value.lastIndexOf('e');
                    if (indexOfE > -1 || indexOfDot > 6 || indexOfDot === -1 && value.length > 6) {
                        value = (Number(value).toExponential(2)).toString();
                    } else {
                        value = (DgtEngine.roundOff(Number(value), this.measurementAvtars[count].properties.precision)).toString();
                    }
                }
                measureObject.values[0].push(value);
            }
            if (avtars[0].length === 0) {
                for (cols = 0; cols < this.measurementAvtars.length; cols++) {
                    if (this.measurementAvtars[cols].properties.labelText) {
                        measureObject.label.push(this.measurementAvtars[cols].deletePrefixedString(this.measurementAvtars[cols].properties.labelText));
                    } else {
                        measureObject.label.push(this.measurementAvtars[cols].properties.labelTextOriginal);
                    }
                    measureObject.parameters.push({
                        "inputReference": this.measurementAvtars[rows].creator.getParams().inputReference,
                        "objectIndexInInputReference": this.measurementAvtars[rows].creator.getParams().objectIndexInInputReference
                    });
                }
                return measureObject;
            }
            for (cols in avtars) {
                for (rows = 0; rows < avtars[cols].length; rows++) {
                    if (!avtars[cols][rows]._universe) {
                        avtars[cols].splice(rows, 1);
                        rows--;
                    }
                    if (avtars[cols].length === 0) {
                        avtars.splice(cols, 1);
                        if (!avtars[cols]) {
                            break;
                        }
                    }
                }
            }

            if (!avtars[0]) {
                return {};
            }
            for (rows = 0; rows < avtars[0].length; rows++) {
                measureObject.values.push([]);
                measureObject.values[rows + 1].push(avtars[0][rows].birthdata.depth);
            }
            for (rows = 0; rows < this.measurementAvtars.length; rows++) {
                if (this.measurementAvtars[rows].properties.labelText) {
                    measureObject.label.push(this.measurementAvtars[rows].deletePrefixedString(this.measurementAvtars[rows].properties.labelText));
                } else {
                    measureObject.label.push(this.measurementAvtars[rows].properties.labelTextOriginal);
                }
                measureObject.parameters.push({
                    "inputReference": this.measurementAvtars[rows].creator.getParams().inputReference,
                    "objectIndexInInputReference": this.measurementAvtars[rows].creator.getParams().objectIndexInInputReference
                });
            }
            for (cols = 0; cols < avtars.length; cols++) {
                for (rows = 0; rows < avtars[cols].length; rows++) {
                    value = avtars[cols][rows].getDisplayedValueAsString();
                    species = avtars[cols][rows].species;
                    if (value === 'NaN') {
                        value = 'undefined';
                    } else if (species !== 'measureCoordinate' && species !== 'measureEquation') {
                        indexOfDot = value.indexOf('.');
                        indexOfE = value.lastIndexOf('e');

                        if (indexOfE > -1 || indexOfDot > 6 || indexOfDot === -1 && value.length > 6) {
                            value = (Number(value).toExponential(2)).toString();
                        } else {
                            value = (DgtEngine.roundOff(Number(value), avtars[cols][rows].properties.precision)).toString();
                        }
                    }
                    measureObject.values[rows + 1].push(value);

                }
            }
            return measureObject;
        }
    }, { //STATIC
        "isParentOf": function(parentArray, child, selfNotAllowed) {
            var loopVar1, loopVar2, DgtIteration = MathUtilities.Tools.Dgt.Models.DgtIteration;
            for (loopVar1 in parentArray) {
                if (parentArray[loopVar1] === child && !selfNotAllowed) {
                    return true;
                }
            }
            if (child.creator) {
                if (child.creator.species === 'terminalPoint') {
                    return false;
                }
                for (loopVar1 in parentArray) {
                    for (loopVar2 in child.creator.sources) {
                        if (parentArray[loopVar1] === child.creator.sources[loopVar2]) {
                            return true;
                        }

                    }
                    if (child.creator.anchor) {
                        if (child.creator.anchor === parentArray[loopVar1]) {
                            return true;
                        }

                    }

                }
                for (loopVar2 in child.creator.sources) {
                    if (DgtIteration.isParentOf(parentArray, child.creator.sources[loopVar2])) {
                        return true;
                    }
                }
                if (child.creator.anchor && DgtIteration.isParentOf(parentArray, child.creator.anchor)) {
                    return true;
                }
            }

        }
    });
})(window.MathUtilities);
