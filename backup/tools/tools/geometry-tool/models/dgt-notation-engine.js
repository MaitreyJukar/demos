/* globals $, window, geomFunctions  */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Models.DgtNotationEngine = Backbone.Model.extend({
        "engine": null,
        "notationView": null,
        "currentRegions": null,
        "centerPtObject": null,
        "startPt": null,
        "endPt": null,
        "startShapeObj": null,
        "endShapeObj": null,
        "pointsOnShapeObj": [],
        "regionPoints": [],
        "considerationPoints": [],
        "via": null,
        "angleMarkerType": null,
        "viaPoint": null,
        "showDirection": null,

        "initialize": function(options) {
            this.setEngine(options.engine);
            this.regionPoints = [];
            this.pointOnShapeObj = [];
            this.considerationPoints = [];
            this.notationView = new MathUtilities.Tools.Dgt.Views.DgtNotation({
                "model": new MathUtilities.Tools.Dgt.Models.DgtNotation()
            });
        },

        "setEngine": function(engine) {
            this.engine = engine;
        },

        "onAnnotateDrag": function(postDragData) {
            var shapeObj,
                equation = postDragData.equation;

            if (equation) {
                shapeObj = equation.getParent();
            }

            if (this.engine.grid.getGridMode() !== 'annotation-mode' || shapeObj.species !== 'tickMark') {
                return;
            }

            equation.trigger('post-drag', postDragData.clone());
        },

        "shapeLayerAnnotateClick": function(event) {
            if (!event.target.equation) {
                return;
            }

            var engine = this.engine,
                defaultParams, tickMarkPoint,
                shape = event.target.equation.getParent();

            if (engine.getOperationMode() === 'nonGeometricDrawing') {
                if (['line', 'ray', 'segment', 'circle', 'arc', 'tickMark', 'angleMark'].indexOf(shape.species) === -1 || shape._universe) {
                    return;
                }
                if (['tickMark', 'angleMark'].indexOf(shape.species) > -1) {
                    shape.updateStrokeCount();
                } else {
                    defaultParams = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(engine.dgtUI.model.dgtPopUpView.model.valuesForNotation.tickMark);
                    tickMarkPoint = engine.grid._getGraphPointCoordinates([event.point.x, event.point.y]);
                    defaultParams.offset = MathUtilities.Tools.Dgt.Models.DgtShape.getOffsetForPointOnShape(shape.species, tickMarkPoint, shape.equation.getConstants());
                    defaultParams.sourcesId = [shape.id];
                    engine.perform('drawTickMark', defaultParams);
                }
            }
        },

        "pointLayerAnnotateStart": function(event) {

            if (!event.target.equation) {
                return;
            }
            var point = event.target.equation.getParent();
            if (point._universe) {
                return;
            }
            if (this.engine.getOperationMode() === 'nonGeometricDrawing') {
                this.notationView = new MathUtilities.Tools.Dgt.Views.DgtNotation({
                    "model": new MathUtilities.Tools.Dgt.Models.DgtNotation()
                });
                this._regionsForAngleNotation(point);
            }
        },

        "gridLayerAnnotateDragFromPoint": function(event) {
            if (!(event.point && this.centerPtObject)) {
                return;
            }

            var eventPointCoordsInCanvas, gridCoordsOfPt,
                point = event.point;

            eventPointCoordsInCanvas = [point.x, point.y];
            gridCoordsOfPt = this.engine.grid._getGraphPointCoordinates(eventPointCoordsInCanvas);

            this._drawAngleNotationPreviewFromPoint(gridCoordsOfPt);
        },

        "pointLayerAnnotateEnd": function() {
            if (this.considerationPoints.length > 0) {
                this.drawAngleNotation();
            }
        },


        "_regionsForAngleNotation": function(target) {
            var linesPassingThroughPoint, objWidConsiderationPoints,
                regions, MAX_REGIONS_REQUIRED = 2;
            if (target.species === 'point') {
                this.centerPtObject = target;
                linesPassingThroughPoint = this.linesPassingThroughAGivenPoint(target);
                objWidConsiderationPoints = this.findObjectsWithConsiderationPoints(target, linesPassingThroughPoint);
                regions = this.generateRegions(target, objWidConsiderationPoints);

                if (regions.length < MAX_REGIONS_REQUIRED) {
                    return;
                }
                this.currentRegions = regions;
            }
        },


        "linesPassingThroughAGivenPoint": function(commonPoint) {
            var creator = commonPoint.creator,
                _childrenRelationships, linesPassingThroughACommonPoint = [],
                ctr, source, sourceCount, len, lineObj, isValid,
                creationMethod, linesThroughATransformedPoint,
                offspring, MAX_SOURCES_FOR_BISECTOR = 3,
                noOfLines, lineCount, commonSpouse, relation,
                commonPointGridCoords = commonPoint.equation.getPoints()[0];

            // find source lines of the common point.
            if (creator) {
                sourceCount = creator.getSourceCount();
                for (ctr = 0; ctr < sourceCount; ctr++) {
                    source = creator.getSource(ctr);
                    if (source._universe || ['line', 'ray', 'segment'].indexOf(source.species) === -1 ||
                        source.properties.binaryInvisibility !== 0) {
                        continue;
                    }
                    isValid = this.isValidObject(source, commonPointGridCoords);
                    if (isValid) {
                        linesPassingThroughACommonPoint.push(source);
                    }
                }
            }

            // find offspring lines of the common point
            if (commonPoint._childrenRelationships) {
                _childrenRelationships = commonPoint._childrenRelationships;
                len = _childrenRelationships.length;
                for (ctr = 0; ctr < len; ctr++) {
                    offspring = _childrenRelationships[ctr].offspring;
                    if (offspring._universe || ['line', 'ray', 'segment'].indexOf(offspring.species) === -1 ||
                        offspring.properties.binaryInvisibility !== 0) {
                        continue;
                    }
                    // offspring line is bisector then check if common point is the second point..
                    // or else angle markers will also be drawn on the other sources of the bisector..

                    if (offspring._creationMethod && ['bisector', 'rayBisector', 'segmentBisector'].indexOf(offspring._creationMethod) > -1 &&
                        _childrenRelationships[ctr].getSourceCount() === MAX_SOURCES_FOR_BISECTOR &&
                        $.inArray(commonPoint, _childrenRelationships[ctr].sources) !== 1) {
                        continue;
                    }
                    isValid = this.isValidObject(offspring, commonPointGridCoords);
                    if (isValid) {
                        linesPassingThroughACommonPoint.push(offspring);
                    }
                }
            }

            creationMethod = commonPoint._creationMethod;

            if (creationMethod && ['translate', 'rotate', 'dilate', 'reflect'].indexOf(creationMethod) > -1) {
                linesThroughATransformedPoint = this.linesPassingThroughATransformedPoint(commonPoint);
                while (linesThroughATransformedPoint.length !== 0) {
                    lineObj = linesThroughATransformedPoint.shift();
                    if ($.inArray(lineObj, linesPassingThroughACommonPoint) === -1) {
                        linesPassingThroughACommonPoint.push(lineObj);
                    }
                }
            }

            //To detect Angle Bisector through lines passing through a common point...
            noOfLines = linesPassingThroughACommonPoint.length;
            for (lineCount = 0; lineCount < noOfLines; lineCount++) {
                _childrenRelationships = linesPassingThroughACommonPoint[lineCount]._childrenRelationships;
                len = _childrenRelationships.length;
                for (ctr = 0; ctr < len; ctr++) {
                    relation = _childrenRelationships[ctr];
                    offspring = relation.offspring;

                    if (offspring._universe || ['line', 'ray', 'segment'].indexOf(offspring.species) === -1 ||
                        offspring.properties.binaryInvisibility !== 0) {
                        continue;
                    }

                    // offspring line is bisector then check if common spouse of both the sources is the commonPoint..
                    // or else angle markers will not be drawn for minor angle..
                    if (offspring._creationMethod && ['bisector', 'rayBisector', 'segmentBisector'].indexOf(offspring._creationMethod) > -1) {
                        commonSpouse = MathUtilities.Tools.Dgt.Models.DgtOperation.getCommonSpouse(relation.getSource(0).creator, relation.getSource(1).creator);
                        if (commonSpouse && commonSpouse[0] && commonSpouse[0] !== commonPoint) {
                            continue;
                        }
                    }
                    isValid = this.isValidObject(offspring, commonPointGridCoords);
                    if (isValid && $.inArray(offspring, linesPassingThroughACommonPoint) === -1) {
                        linesPassingThroughACommonPoint.push(offspring);
                    }
                }
            }

            return linesPassingThroughACommonPoint;

        },

        "getSourcesAndTransformationFactor": function(transformedObject, sourceType) {
            var offspring = transformedObject,
                creator, transformationFactors = [],
                source, sourceStack = [],
                loopCtr, parentSource,
                noOfSources, child,
                _childrenRelationships, noOfRelations,
                creationMethod, condition = false,
                offspringChildrenRelationships,
                len, ctr, relation,
                sourceCount, loopVar, bisectorSourcePoint;


            // Move to the untransformed parent source of transformedObject
            do {
                creator = offspring.creator;
                transformationFactors.push(this.getTransformationFactors(creator));
                parentSource = creator.getSource(0);
                creationMethod = parentSource._creationMethod;
                condition = creationMethod && ['translate', 'rotate', 'dilate', 'reflect'].indexOf(creationMethod) !== -1;
                if (condition) {
                    offspring = parentSource;
                }
            } while (condition);

            sourceStack.push(parentSource);

            if (parentSource.creator) {
                noOfSources = parentSource.creator.getSourceCount();
                for (loopCtr = 0; loopCtr < noOfSources; loopCtr++) {
                    source = parentSource.creator.getSource(loopCtr);
                    if ($.inArray(source, sourceStack) === -1 &&
                        (sourceType === 'point' && ['line', 'ray', 'segment'].indexOf(source.species) > -1 ||
                            source.species === 'point')) {
                        sourceStack.push(source);
                    }

                    if (parentSource._creationMethod && ['bisector', 'rayBisector', 'segmentBisector'].indexOf(parentSource._creationMethod) > -1) {
                        if (source.creator) {
                            sourceCount = source.creator.getSourceCount();
                            for (loopVar = 0; loopVar < sourceCount; loopVar++) {
                                bisectorSourcePoint = source.creator.getSource(loopVar);
                                if ($.inArray(bisectorSourcePoint, sourceStack) === -1 &&
                                    (sourceType === 'point' && ['line', 'ray', 'segment'].indexOf(bisectorSourcePoint.species) > -1 ||
                                        bisectorSourcePoint.species === 'point')) {
                                    sourceStack.push(bisectorSourcePoint);
                                }
                            }
                        }
                    }
                }
            }
            if (parentSource._childrenRelationships) {
                _childrenRelationships = parentSource._childrenRelationships;
                noOfRelations = _childrenRelationships.length;
                for (loopCtr = 0; loopCtr < noOfRelations; loopCtr++) {
                    child = _childrenRelationships[loopCtr].offspring;
                    if ($.inArray(child, sourceStack) === -1 && child !== transformedObject &&
                        (sourceType === 'point' && ['line', 'ray', 'segment'].indexOf(child.species) > -1 ||
                            sourceType === 'shape' && child.species === 'point')) {

                        sourceStack.push(child);
                        // Case for Angle Bisector...
                        if (sourceType === 'point' && ['line', 'ray', 'segment'].indexOf(child.species) > -1) {

                            offspringChildrenRelationships = child._childrenRelationships;
                            len = offspringChildrenRelationships.length;

                            for (ctr = 0; ctr < len; ctr++) {
                                relation = offspringChildrenRelationships[ctr];
                                offspring = relation.offspring;

                                if (offspring._universe || ['line', 'ray', 'segment'].indexOf(offspring.species) === -1 ||
                                    offspring.properties.binaryInvisibility !== 0) {
                                    continue;
                                }

                                if (offspring._creationMethod && ['bisector', 'rayBisector', 'segmentBisector'].indexOf(offspring._creationMethod) > -1) {
                                    sourceStack.push(offspring);
                                }

                            }
                        }
                        // Case for Angle Bisector...
                    }
                }
            }

            return {
                "sourceStack": sourceStack,
                "transformationFactors": transformationFactors
            };
        },

        "getAllTransformedObjects": function(sourceStack, transformationFactors, sourceType) {
            var relationStack, noOfSources, loopCtr, offspring,
                _childrenRelationships, child,
                relationCount, loopVar,
                childRelations,
                noOfRelations, relation, transformedFactor,
                source;

            do {
                _childrenRelationships = [];
                relationStack = [];

                noOfSources = sourceStack.length;
                for (loopCtr = 0; loopCtr < noOfSources; loopCtr++) {
                    source = sourceStack.shift();
                    childRelations = source._childrenRelationships;
                    noOfRelations = childRelations.length;
                    for (loopVar = 0; loopVar < noOfRelations; loopVar++) {
                        relation = childRelations[loopVar];
                        if ($.inArray(relation, _childrenRelationships) === -1) {
                            _childrenRelationships.push(relation);
                        }
                    }
                }

                noOfRelations = _childrenRelationships.length;
                transformedFactor = transformationFactors.pop();
                for (loopCtr = 0; loopCtr < noOfRelations; loopCtr++) {
                    relation = _childrenRelationships.shift();
                    if (relation.species !== transformedFactor.type || relation.anchor !== transformedFactor.anchor ||
                        !MathUtilities.Components.Utils.Models.Utils.isEqual(relation.getParams(), transformedFactor.factor)) {
                        continue;
                    }
                    relationStack.push(relation);
                }

                noOfRelations = relationStack.length;
                for (loopCtr = 0; loopCtr < noOfRelations; loopCtr++) {
                    offspring = relationStack.shift().offspring;
                    if ($.inArray(offspring, sourceStack) === -1) {
                        sourceStack.push(offspring);
                    }
                    if (offspring._childrenRelationships) {
                        _childrenRelationships = offspring._childrenRelationships;
                        relationCount = _childrenRelationships.length;
                        for (loopVar = 0; loopVar < relationCount; loopVar++) {
                            child = _childrenRelationships[loopVar].offspring;
                            if ($.inArray(child, sourceStack) === -1 && (sourceType === 'point' && ['line', 'ray', 'segment'].indexOf(child.species) > -1 || source.species === 'point')) {
                                sourceStack.push(child);
                            }
                        }
                    }
                }
            } while (transformationFactors.length !== 0);

            return sourceStack;
        },

        "isValidObject": function(lineObj, pointCoords) {
            var perpendicularDistance,
                hitAreaCanvasDistAroundObject, hitAreaGridDistAroundObject,
                constants = lineObj.equation.getConstants(),
                species = lineObj.species,
                isOnShape = MathUtilities.Tools.Dgt.Models.DgtEngine.isOnShape(constants, species, pointCoords);

            if (!isOnShape && species !== 'line') {
                return false;
            }
            perpendicularDistance = geomFunctions.pointLineDistance(constants, pointCoords);
            hitAreaCanvasDistAroundObject = lineObj.equation.getDragHitThickness() / 2; // considering distance of either sides
            hitAreaGridDistAroundObject = this.engine.grid._getGridDistance([hitAreaCanvasDistAroundObject, 0])[0];
            return perpendicularDistance < hitAreaGridDistAroundObject;
        },

        "linesPassingThroughATransformedPoint": function(commonTransformedPoint) {
            var source, loopCtr, sourceSpecie,
                noOfSources, isOnShape,
                linesThroughPoint = [],
                division = commonTransformedPoint.division,
                commonPointCoords = commonTransformedPoint.equation.getPoints()[0],
                sourcesAndTransformationFactors = this.getSourcesAndTransformationFactor(commonTransformedPoint, division),
                sourceStack = sourcesAndTransformationFactors.sourceStack,
                transformationFactors = sourcesAndTransformationFactors.transformationFactors;

            sourceStack = this.getAllTransformedObjects(sourceStack, transformationFactors, division);
            noOfSources = sourceStack.length;

            for (loopCtr = 0; loopCtr < noOfSources; loopCtr++) {
                source = sourceStack.shift();
                sourceSpecie = source.species;
                if (['line', 'ray', 'segment'].indexOf(sourceSpecie) === -1) {
                    continue;
                }
                isOnShape = this.isValidObject(source, commonPointCoords);
                if (isOnShape) {
                    linesThroughPoint.push(source);
                }
            }

            return linesThroughPoint;
        },

        "getTransformationFactors": function(creator) {
            return {
                "type": creator.species,
                "anchor": creator.anchor,
                "factor": creator.getParams()
            };
        },

        "getActualPointsOnTransformedLine": function(transformedLineObj) {
            var source, loopCtr,
                pointCoords, sourceSpecie,
                noOfSources, isOnShape,
                pointsOnLine = [],
                division = transformedLineObj.division,
                sourcesAndTransformationFactors = this.getSourcesAndTransformationFactor(transformedLineObj, division),
                sourceStack = sourcesAndTransformationFactors.sourceStack,
                transformationFactors = sourcesAndTransformationFactors.transformationFactors;

            sourceStack = this.getAllTransformedObjects(sourceStack, transformationFactors, division);
            noOfSources = sourceStack.length;

            for (loopCtr = 0; loopCtr < noOfSources; loopCtr++) {
                source = sourceStack.shift();
                sourceSpecie = source.species;
                if (sourceSpecie !== 'point') {
                    continue;
                }
                pointCoords = source.equation.getPoints()[0];
                isOnShape = this.isValidObject(transformedLineObj, pointCoords);
                if (isOnShape) {
                    pointsOnLine.push(source);
                }
            }

            return pointsOnLine;
        },

        "findObjectsWithConsiderationPoints": function(commonPoint, linesPassingThroughACommonPoint) {
            var ctr, loopVar, noOfConsiderationPoints, specie, considerationPoint,
                objectsWithConsiderationPoints = [],
                len = linesPassingThroughACommonPoint.length,
                commonPointCoords = commonPoint.equation.getPoints()[0];

            for (ctr = 0; ctr < len; ctr++) {
                specie = linesPassingThroughACommonPoint[ctr].species;
                considerationPoint = this.findConsiderationPoints(commonPointCoords, linesPassingThroughACommonPoint[ctr], specie);
                noOfConsiderationPoints = considerationPoint.length;
                for (loopVar = 0; loopVar < noOfConsiderationPoints; loopVar++) {
                    objectsWithConsiderationPoints.push(considerationPoint[loopVar]);
                }
            }

            objectsWithConsiderationPoints.sort(function(a, b) {
                return a.angle > b.angle ? 1 : -1;
            });

            return objectsWithConsiderationPoints;
        },

        "findConsiderationPoints": function(commonPointCoords, line, specie) {
            var noOfPointsOnLine, centerPtObject, centerPtObjectIndex,
                considerationPointCoords, seed, pointObj1, pointObj2, angle,
                pointObjCoords, objectsWithConsiderationPoints = [],
                considerationPtObj,
                offset, oppositePointCoords, commonPointWithOffset, commonPointOffset,
                actualPointsOnLine = this.getActualPointsOnLineWithOffset(line),
                sortFunc = function(a, b) {
                    return a.offset > b.offset ? 1 : -1;
                };

            actualPointsOnLine.sort(sortFunc);

            noOfPointsOnLine = actualPointsOnLine.length;

            seed = line.equation.getConstants();

            if (noOfPointsOnLine > 1) {

                centerPtObject = this.centerPtObject;
                centerPtObjectIndex = this.getIndexOfPointInObj(centerPtObject, actualPointsOnLine);
                /*
                    if center point is not an endpoint then consider endPoints of that lineObj..
                    or else consider other endPoint and as oppositePoint and calculate the other endPoint..
                */
                if (centerPtObjectIndex !== 0 && centerPtObjectIndex !== noOfPointsOnLine - 1) {
                    pointObj1 = actualPointsOnLine[0].point;
                    pointObj2 = actualPointsOnLine[noOfPointsOnLine - 1].point;
                } else if (centerPtObjectIndex === noOfPointsOnLine - 1) {
                    pointObj1 = actualPointsOnLine[0].point;
                    oppositePointCoords = pointObj1.equation.getPoints()[0];
                } else if (centerPtObjectIndex === 0) {
                    pointObj2 = actualPointsOnLine[noOfPointsOnLine - 1].point;
                    oppositePointCoords = pointObj2.equation.getPoints()[0];
                }

                if (oppositePointCoords && (specie === 'line' || specie === 'ray' && centerPtObjectIndex !== 0 ||
                    specie === 'segment' && centerPtObjectIndex !== 0 && centerPtObjectIndex !== noOfPointsOnLine - 1)) {
                    considerationPtObj = this.findCorrespondingConsiderationPoint(line, commonPointCoords, oppositePointCoords);
                }

            }

            if (pointObj1) {
                pointObjCoords = pointObj1.equation.getPoints()[0];
                angle = Math.atan2(pointObjCoords[1] - commonPointCoords[1], pointObjCoords[0] - commonPointCoords[0]);
                objectsWithConsiderationPoints.push({
                    "pointOnShapes": [line],
                    "point": pointObj1,
                    "angle": angle
                });
            }
            if (pointObj2) {
                pointObjCoords = pointObj2.equation.getPoints()[0];
                angle = Math.atan2(pointObjCoords[1] - commonPointCoords[1], pointObjCoords[0] - commonPointCoords[0]);
                objectsWithConsiderationPoints.push({
                    "pointOnShapes": [line],
                    "point": pointObj2,
                    "angle": angle
                });
            }
            if (considerationPtObj) {
                considerationPointCoords = considerationPtObj.point;
                offset = considerationPtObj.offset;

                angle = Math.atan2(considerationPointCoords[1] - commonPointCoords[1], considerationPointCoords[0] - commonPointCoords[0]);
                objectsWithConsiderationPoints.push({
                    "pointOnShapes": [line],
                    "point": considerationPointCoords,
                    "offset": offset,
                    "angle": angle
                });
            }
            // If there are no consdieration points on shape
            if (!(pointObj1 || pointObj2 || considerationPointCoords)) {
                commonPointWithOffset = this.getPointObjWithOffset(line, commonPointCoords);
                commonPointOffset = commonPointWithOffset.offset;


                if (commonPointOffset < 1) {
                    oppositePointCoords = [seed.x1, seed.y1];
                } else {
                    oppositePointCoords = [seed.x2, seed.y2];
                }

                considerationPtObj = this.findCorrespondingConsiderationPoint(line, commonPointCoords, oppositePointCoords);

                considerationPointCoords = considerationPtObj.point;
                offset = considerationPtObj.offset;

                angle = Math.atan2(considerationPointCoords[1] - commonPointCoords[1], considerationPointCoords[0] - commonPointCoords[0]);
                objectsWithConsiderationPoints.push({
                    "pointOnShapes": [line],
                    "point": considerationPointCoords,
                    "offset": offset,
                    "angle": angle
                });



                if (specie === 'line' || specie === 'ray' && commonPointOffset !== 0 ||
                    specie === 'segment' && commonPointOffset !== 0 && commonPointOffset !== 1) {
                    oppositePointCoords = considerationPtObj.point;
                    considerationPtObj = this.findCorrespondingConsiderationPoint(line, commonPointCoords, oppositePointCoords);

                    considerationPointCoords = considerationPtObj.point;
                    offset = considerationPtObj.offset;

                    angle = Math.atan2(considerationPointCoords[1] - commonPointCoords[1], considerationPointCoords[0] - commonPointCoords[0]);
                    objectsWithConsiderationPoints.push({
                        "pointOnShapes": [line],
                        "point": considerationPointCoords,
                        "offset": offset,
                        "angle": angle
                    });
                }

            }

            return objectsWithConsiderationPoints;
        },

        "generateRegions": function(commonPoint, sortedObjWithConsiderationPoints) {
            var regions = [],
                i, j, from, via, to, fromObj, toObj, considerationPts = [],
                objWidConsiderationPt = [],
                incenterPt, MAX_POINTS = 2,
                commonPtCoords = commonPoint.equation.getPoints()[0],
                len = sortedObjWithConsiderationPoints.length;

            for (i = 0; i < len; i++) {

                for (j = 0; j < MAX_POINTS; j++) {
                    if (i + j === len) {
                        objWidConsiderationPt[j] = sortedObjWithConsiderationPoints[0];
                    } else {
                        objWidConsiderationPt[j] = sortedObjWithConsiderationPoints[i + j];
                    }
                    if (objWidConsiderationPt[j].point.division) {
                        considerationPts[j] = objWidConsiderationPt[j].point.equation.getPoints()[0];
                    } else {
                        considerationPts[j] = objWidConsiderationPt[j].point;
                    }
                }

                incenterPt = geomFunctions.getTriangleIncentre(considerationPts[0][0], considerationPts[0][1], commonPtCoords[0], commonPtCoords[1], considerationPts[1][0], considerationPts[1][1]);

                from = objWidConsiderationPt[0].angle;
                via = Math.atan2(incenterPt[1] - commonPtCoords[1], incenterPt[0] - commonPtCoords[0]);
                to = objWidConsiderationPt[1].angle;

                fromObj = objWidConsiderationPt[0];
                toObj = objWidConsiderationPt[1];

                regions.push({
                    "from": from,
                    "via": via,
                    "to": to,
                    "fromObj": fromObj,
                    "toObj": toObj
                });
            }

            return regions;

        },

        "getRegionForPoint": function(targetPointCoords, slopeFromCommonPoint) {
            if (!this.currentRegions) {
                return void 0;
            }

            var loopVar, from, to,
                regionAngle, angle, thresholdValue,
                ONE_ROTATION_ANGLE = 360,
                minThresholdValue = MathUtilities.Tools.Dgt.Models.DgtNotationEngine.MIN_THRESHOLD,
                maxThresholdValue = MathUtilities.Tools.Dgt.Models.DgtNotationEngine.MAX_THRESHOLD,
                regions = this.currentRegions,
                len = regions.length;

            for (loopVar = 0; loopVar < len; loopVar++) {
                regionAngle = geomFunctions.getArcAngle(regions[loopVar]);

                from = regions[loopVar].from;
                to = regions[loopVar].to;

                angle = geomFunctions.getArcAngle({
                    "from": from,
                    "via": slopeFromCommonPoint,
                    "to": to
                });

                if (regionAngle < 0) {
                    regionAngle = regionAngle + ONE_ROTATION_ANGLE;
                }

                thresholdValue = regionAngle - angle;

                if (thresholdValue >= minThresholdValue && thresholdValue <= maxThresholdValue) {
                    return regions[loopVar];
                }

            }
        },

        "_drawAngleNotationPreviewFromPoint": function(targetPointCoords) {
            var regions, slope, key, considerationPoints = [],
                considerationPointsCoords = [],
                type, pointObj,
                commonPoint = this.centerPtObject,
                commonPtCoords = commonPoint.equation.getPoints()[0];

            slope = Math.atan2(targetPointCoords[1] - commonPtCoords[1], targetPointCoords[0] - commonPtCoords[0]);

            regions = this.getRegionForPoint(targetPointCoords, slope);
            for (key in regions) {
                if (key === 'fromObj' || key === 'toObj') {
                    if (key === 'fromObj') {
                        type = 'startPoint';
                    } else {
                        type = 'endPoint';
                    }

                    regions[key].type = type;
                    considerationPoints.push(regions[key]);
                    pointObj = regions[key].point;


                    if (pointObj.division) {
                        considerationPointsCoords.push(pointObj.equation.getPoints()[0]);

                    } else {
                        considerationPointsCoords.push(pointObj);
                    }

                }

                if (considerationPoints.length === 1) {
                    considerationPoints.push({
                        "point": commonPoint,
                        "type": 'centerPoint'
                    });
                    considerationPointsCoords.push(commonPtCoords);
                }
            }

            if (considerationPoints.length === 0) {
                return;
            }

            this.considerationPoints = considerationPoints;

            this.drawAngleNotationPreview(considerationPoints, slope);

        },

        "setDefaultValuesForAngleNotation": function(arcSeed) {
            var arcAngleInDegrees,
                dgtPopUpModel = this.engine.dgtUI.model.dgtPopUpView.model,
                thresholdValue, HALF_ROTATION_ANGLE = 180,
                minThresholdValue = MathUtilities.Tools.Dgt.Models.DgtNotationEngine.MIN_THRESHOLD,
                maxThresholdValue = MathUtilities.Tools.Dgt.Models.DgtNotationEngine.MAX_THRESHOLD;

            arcAngleInDegrees = geomFunctions.getArcAngle(arcSeed, false);
            thresholdValue = HALF_ROTATION_ANGLE - arcAngleInDegrees;
            if (arcAngleInDegrees > 0 && (thresholdValue >= minThresholdValue && thresholdValue <= maxThresholdValue)) {
                dgtPopUpModel.valuesForNotation.angleMark.typeOfMarker = 'counter-clockwise';
            } else if (arcAngleInDegrees < 0 && (thresholdValue >= minThresholdValue && thresholdValue <= maxThresholdValue)) {
                dgtPopUpModel.valuesForNotation.angleMark.typeOfMarker = 'clockwise';
            } else if (Math.abs(arcAngleInDegrees) > HALF_ROTATION_ANGLE) {
                dgtPopUpModel.valuesForNotation.angleMark.typeOfMarker = 'reflex';
            } else {
                dgtPopUpModel.valuesForNotation.angleMark.typeOfMarker = 'simple';
            }

            this.notationView.model.showDirection = this.showDirection;

        },



        "drawAngleNotationPreview": function(considerationPoints, via) {
            var key, considerationPtCoords = [],
                pointObj, arcSeed,
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData(),
                notationViewModel = this.notationView.model;

            this.notationView.removeNotation();

            for (key in considerationPoints) {
                pointObj = considerationPoints[key].point;
                if (pointObj.division) {
                    considerationPtCoords.push(pointObj.equation.getPoints()[0]);
                } else {
                    considerationPtCoords.push(pointObj);
                }
            }

            arcSeed = notationViewModel.getArcSeed(considerationPtCoords);

            arcSeed.via = via;

            this.setDefaultValuesForAngleNotation(arcSeed);

            notationViewModel.isPreview = true;

            notationViewModel.init('angleMark', this.engine);
            updateDataObject.seed = arcSeed;
            notationViewModel.setSeed(updateDataObject);

            notationViewModel.isPreview = false;

            this.engine.grid.refreshView();

        },

        "shapeLayerAnnotateStart": function(event) {

            if (!(event.target.equation && event.point)) {
                return;
            }
            var engine = this.engine,
                eventPointCanvasCoords, eventPointGridCoords, target, shapeObj, pointsOnShapeObj;

            target = event.target;
            shapeObj = target.equation.getParent();
            if (shapeObj && shapeObj._universe) {
                return;
            }
            eventPointCanvasCoords = [event.point.x, event.point.y];
            eventPointGridCoords = engine.grid._getGraphPointCoordinates(eventPointCanvasCoords);
            this.startPt = eventPointGridCoords;

            this.startShapeObj = shapeObj;
            engine.eventListenerCanvas.notationFromShape = true;
            pointsOnShapeObj = this.getActualPointsOnLineWithOffset(shapeObj);
            this.addShapeObjWithPointsOnIt(shapeObj, pointsOnShapeObj);

        },

        "annotateRollOverOnShape": function(equation, event) {

            if (!(this.startPt && this.viaPoint && equation && event.point)) {
                return;
            }

            var shapeObj, pointsOnShapeObj,
                considerationPoints,
                centerPointCoords, viaPoint, via,
                eventPointCanvasCoords = [event.point.x, event.point.y],
                eventPointGridCoords = this.engine.grid._getGraphPointCoordinates(eventPointCanvasCoords);
            this.endPt = eventPointGridCoords;

            shapeObj = equation.getParent();
            this.endShapeObj = shapeObj;

            pointsOnShapeObj = this.getActualPointsOnLineWithOffset(shapeObj);
            this.addShapeObjWithPointsOnIt(shapeObj, pointsOnShapeObj);

            considerationPoints = this.findCommonPoint();

            if (!considerationPoints && this.viaPoint) {
                this.endPt = null;
                this.endShapeObj = null;
                this.centerPtObject = null;
                this.considerationPoints = [];
                return;
            }

            if (considerationPoints[1].point.division) {
                centerPointCoords = considerationPoints[1].point.equation.getPoints()[0];
            } else {
                centerPointCoords = considerationPoints[1].point;
            }

            viaPoint = this.viaPoint;
            via = Math.atan2(viaPoint[1] - centerPointCoords[1], viaPoint[0] - centerPointCoords[0]);

            this.showDirection = true;

            this.drawAngleNotationPreview(considerationPoints, via);

        },

        "annotateRollOutFromShape": function(equation, event) {
            this.setPossibleViaPoint(equation, event);
            this.endPt = null;
            this.endShapeObj = null;
            this.regainStateOfShapeObjPoints();
            this.notationView.removeNotation();
        },

        "regainStateOfShapeObjPoints": function() {
            var shapeObjPoints = this.pointsOnShapeObj,
                points, objCtr, pointCtr;

            for (objCtr in shapeObjPoints) {
                points = shapeObjPoints[objCtr].points;
                for (pointCtr in points) {
                    delete points[pointCtr].type;
                }
            }
        },

        "setPossibleViaPoint": function(equation, event) {

            if (!event.point || this.startShapeObj !== equation.getParent() || this.centerPtObject) {
                return;
            }

            var gridCoordsOfEventPoint, canvasCoordsOfEventPoint;

            canvasCoordsOfEventPoint = [event.point.x, event.point.y];
            gridCoordsOfEventPoint = this.engine.grid._getGraphPointCoordinates(canvasCoordsOfEventPoint);
            this.viaPoint = gridCoordsOfEventPoint;

        },


        "getActualPointsOnLineWithOffset": function(lineObj) {
            var linePointsWithOffset = [],
                source, count, pointObj, pointObjects = [],
                sourceCount = 0,
                MAX_SOURCES_FOR_BISECTOR = 3,
                MIN_SOURCES_FOR_BISECTOR = 2,
                commonSpouse, pointsOnTransformedLine,
                offspring, ctr, offset, pointObjCoords, _childrenRelationships, relationCount,
                lineObjSpecie = lineObj.species,
                constants = lineObj.equation.getConstants(),
                creator = lineObj.creator,
                creationMethod = lineObj._creationMethod;

            // Finding source points of the lineObj
            if (creator) {
                sourceCount = creator.getSourceCount();
            }
            for (ctr = 0; ctr < sourceCount; ctr++) {
                source = creator.getSource(ctr);
                //if all the sources are point then consider second source as point on line for angleBisector
                if (creationMethod && ['bisector', 'rayBisector', 'segmentBisector'].indexOf(creationMethod) > -1 &&
                    sourceCount === MAX_SOURCES_FOR_BISECTOR && ctr !== 1) {
                    continue;
                }
                if (creationMethod && ['bisector', 'rayBisector', 'segmentBisector'].indexOf(creationMethod) > -1 &&
                    sourceCount === MIN_SOURCES_FOR_BISECTOR) {
                    commonSpouse = MathUtilities.Tools.Dgt.Models.DgtOperation.getCommonSpouse(creator.getSource(0).creator, creator.getSource(1).creator);
                    if (commonSpouse && commonSpouse[0] && $.inArray(commonSpouse[0], pointObjects) === -1) {
                        pointObjects.push(commonSpouse[0]);
                    }
                }
                if ($.inArray(source, pointObjects) === -1 && source.division === 'point' &&
                    this.engine._standardObjectIds.points.indexOf(source) === -1) {
                    pointObjects.push(source);
                }
            }
            // Finding offspring points of lineObj
            _childrenRelationships = lineObj._childrenRelationships;

            for (relationCount in _childrenRelationships) {
                offspring = _childrenRelationships[relationCount].offspring;
                if (offspring.division === 'point') {
                    pointObjects.push(offspring);
                }
            }

            if (creationMethod && ['translate', 'rotate', 'dilate', 'reflect'].indexOf(creationMethod) > -1) {
                pointsOnTransformedLine = this.getActualPointsOnTransformedLine(lineObj);
                while (pointsOnTransformedLine.length !== 0) {
                    pointObj = pointsOnTransformedLine.shift();
                    if ($.inArray(pointObj, pointObjects) === -1) {
                        pointObjects.push(pointObj);
                    }
                }
            }

            for (count in pointObjects) {
                pointObj = pointObjects[count];
                pointObjCoords = pointObj.equation.getPoints()[0];
                offset = MathUtilities.Tools.Dgt.Models.DgtShape.getOffsetForPointOnShape(lineObjSpecie, pointObjCoords, constants);
                linePointsWithOffset.push({
                    "point": pointObj,
                    "offset": offset
                });
            }

            return linePointsWithOffset;

        },


        "addShapeObjWithPointsOnIt": function(shapeObj, pointsOnObj) {
            var key, pointsOnShapeObj;
            pointsOnShapeObj = this.pointsOnShapeObj;

            for (key in pointsOnShapeObj) {
                if (pointsOnShapeObj[key].shapeObj === shapeObj) {
                    return;
                }
            }

            this.pointsOnShapeObj.push({
                "shapeObj": shapeObj,
                "points": pointsOnObj
            });
        },

        "getShapeObjPoints": function(shapeObj) {
            var ctr, len, pointsOnShapeObj;

            pointsOnShapeObj = this.pointsOnShapeObj.slice();
            len = pointsOnShapeObj.length;

            for (ctr = 0; ctr < len; ctr++) {
                if (pointsOnShapeObj[ctr].shapeObj === shapeObj) {
                    return pointsOnShapeObj[ctr].points.slice();
                }
            }
        },

        // returns an obj wid point, offset & type only if required..
        "getPointObjWithOffset": function(shapeObj, pointOnObj, type) {
            var offset, pointObjCoords;

            if (pointOnObj.division) {
                pointObjCoords = pointOnObj.equation.getPoints()[0];
            } else {
                pointObjCoords = pointOnObj;
            }

            offset = MathUtilities.Tools.Dgt.Models.DgtShape.getOffsetForPointOnShape(shapeObj.species, pointObjCoords, shapeObj.equation.getConstants());

            if (type) {
                return {
                    "point": pointOnObj,
                    "offset": offset,
                    "type": type
                };
            }
            return {
                "point": pointOnObj,
                "offset": offset
            };

        },

        "getIndexOfPointInObj": function(pointObj, shapeObjPoints) {
            var key, currentPointObj;

            for (key in shapeObjPoints) {
                currentPointObj = shapeObjPoints[key].point;
                if (pointObj === currentPointObj) {
                    return parseInt(key, 10);
                }
            }

            return -1;
        },

        "getIndexOfShapeObjPoint": function(shapeObjPoints, type) {
            var ctr, len;

            len = shapeObjPoints.length;

            for (ctr = 0; ctr < len; ctr++) {
                if (shapeObjPoints[ctr].type && shapeObjPoints[ctr].type === type) {
                    return ctr;
                }
            }
        },

        /*
            finds center point between startPoint and endPoint & if there are 2 or more points then consider
            point closer to the endPoint as the center
        */
        "getCenterPointOnShape": function(shapeObjPoints) {

            var centerPointObjIndex,
                startPointIndex = this.getIndexOfShapeObjPoint(shapeObjPoints, 'startPoint'),
                endPointIndex = this.getIndexOfShapeObjPoint(shapeObjPoints, 'endPoint'),
                diffInIndex = endPointIndex - startPointIndex;

            if (diffInIndex === 1 || diffInIndex === -1) {
                return void 0;
            }
            if (diffInIndex > 0) {
                centerPointObjIndex = endPointIndex - 1;
            } else {
                centerPointObjIndex = endPointIndex + 1;
            }

            shapeObjPoints[centerPointObjIndex].type = 'centerPoint';
            return shapeObjPoints[centerPointObjIndex];
        },

        /*
            Finds common source point of two shapes if it is not found then find the intersection point
            and consider that as the center..
        */
        "getIntersectionPointOfShapes": function(startShapeObj, endShapeObj, startShapeObjPoints, endShapeObjPoints) {
            var key, pointObj, shapes,
                startShapeConstants, endShapeConstants, data, intersectionPt, isOnShapes = true,
                index, intersectionPointObj;

            for (key in startShapeObjPoints) {
                pointObj = startShapeObjPoints[key].point;
                index = this.getIndexOfPointInObj(pointObj, endShapeObjPoints);
                if (index >= 0) {
                    startShapeObjPoints[key].type = 'centerPoint';
                    endShapeObjPoints[index].type = 'centerPoint';
                    return startShapeObjPoints[key];
                }
            }

            shapes = [startShapeObj, endShapeObj];

            startShapeConstants = startShapeObj.equation.getConstants();
            endShapeConstants = endShapeObj.equation.getConstants();
            data = [startShapeConstants, endShapeConstants];

            intersectionPt = this.engine.getIntersectionPoint(data, 'lineIntersection');

            for (key in shapes) {
                if (shapes[key].species !== 'line') {
                    isOnShapes = isOnShapes && MathUtilities.Tools.Dgt.Models.DgtEngine.isOnShape(shapes[key].equation.getConstants(), shapes[key].species, intersectionPt[0]);
                }
            }

            if (isOnShapes) {
                intersectionPointObj = {
                    "point": intersectionPt[0],
                    "type": 'centerPoint'
                };
                return intersectionPointObj;
            }

        },

        // generating temporary consideration points on shape
        "findCorrespondingConsiderationPoint": function(lineObj, commonPCoords, oppositePtCoords) {
            var considerationPoint,
                isOnShape, FACTOR = 2,
                commonPointWithOffset = this.getPointObjWithOffset(lineObj, commonPCoords),
                oppositePointWithOffset = this.getPointObjWithOffset(lineObj, oppositePtCoords),
                seed = lineObj.equation.getConstants(),
                specie = lineObj.species,
                distance = geomFunctions.distance2(seed.x1, seed.y1, seed.x2, seed.y2),
                offset = FACTOR / distance;

            if (commonPointWithOffset.offset === oppositePointWithOffset.offset) {
                if (commonPointWithOffset.offset >= 0 && commonPointWithOffset.offset < 1) {
                    offset += commonPointWithOffset.offset;
                } else {
                    offset = commonPointWithOffset.offset - offset;
                }
            } else {
                if (commonPointWithOffset.offset > oppositePointWithOffset.offset) {
                    offset += commonPointWithOffset.offset;
                } else {
                    offset = commonPointWithOffset.offset - offset;
                }
            }

            considerationPoint = geomFunctions.getPointPositionFromOffset(seed.x1, seed.y1, seed.x2, seed.y2, offset);

            if (['segment', 'ray'].indexOf(specie) > -1) {
                isOnShape = MathUtilities.Tools.Dgt.Models.DgtEngine.isOnShape(seed, lineObj.species, considerationPoint);
            } else {
                isOnShape = true;
            }

            if (!isOnShape) {
                if (offset < 0) {
                    offset = 0.05;
                } else {
                    offset = 0.95;
                }

                considerationPoint = geomFunctions.getPointPositionFromOffset(seed.x1, seed.y1, seed.x2, seed.y2, offset);
            }

            return {
                "point": considerationPoint,
                "offset": offset
            };
        },

        //finds the point to be considered as the start or end point for drawing angle markers..
        "getConsiderationPointOnShape": function(shapeObj, pointOnObj, shapeObjPoints, centerPoint, type) {

            var index, pointObj, oppsitePointCoords, considerationPtObj,
                centerPointObj, centerPointCoords, HALF_ROTATION_ANGLE = 180,
                pointIndex = this.getIndexOfShapeObjPoint(shapeObjPoints, type),
                centerPointIndex = this.getIndexOfShapeObjPoint(shapeObjPoints, 'centerPoint'),
                diffInIndex = pointIndex - centerPointIndex;
            /*
                if the difference in index is 1 or -1 that indicates that both the points are consecutive..
                or else there is a point in between them...
            */
            if (diffInIndex === 1 || diffInIndex === -1) {
                if (diffInIndex > 0) {
                    index = pointIndex + 1;
                } else {
                    index = pointIndex - 1;
                }
            } else {
                if (diffInIndex > 0) {
                    index = centerPointIndex + 1;
                } else {
                    index = centerPointIndex - 1;
                }
            }

            /*
                if there is no point to be considered then we generate the consideration point..
            */
            pointObj = shapeObjPoints[index];
            if (pointObj) {
                return {
                    "pointOnShapes": [shapeObj],
                    "point": pointObj.point,
                    "type": type
                };
            }

            centerPointObj = centerPoint.point;
            if (centerPointObj.division === 'point') {
                centerPointCoords = centerPointObj.equation.getPoints()[0];
            } else {
                centerPointCoords = centerPointObj;
            }

            oppsitePointCoords = geomFunctions.rotatePoint(pointOnObj[0], pointOnObj[1], centerPointCoords[0], centerPointCoords[1], HALF_ROTATION_ANGLE, true, false);

            considerationPtObj = this.findCorrespondingConsiderationPoint(shapeObj, centerPoint.point, oppsitePointCoords);
            considerationPtObj.type = type;
            considerationPtObj.pointOnShapes = [shapeObj];

            return considerationPtObj;
        },

        "findCommonPoint": function() {
            var endShapeObjPoints,
                commonPoint, startPoint, endPoint, considerationPoints = [],
                startPt = this.startPt,
                endPt = this.endPt,
                startShapeObj = this.startShapeObj,
                endShapeObj = this.endShapeObj,
                startShapeObjPoints = this.getShapeObjPoints(startShapeObj),
                pointObjWithOffset = this.getPointObjWithOffset(startShapeObj, startPt, 'startPoint'),
                sortFunc = function(a, b) {
                    return a.offset > b.offset ? 1 : -1;
                };

            startShapeObjPoints.push(pointObjWithOffset);

            if (startShapeObj === endShapeObj) {
                endShapeObjPoints = startShapeObjPoints;
            } else {
                endShapeObjPoints = this.getShapeObjPoints(endShapeObj);
            }

            pointObjWithOffset = this.getPointObjWithOffset(endShapeObj, endPt, 'endPoint');
            endShapeObjPoints.push(pointObjWithOffset);


            if (startShapeObjPoints === endShapeObjPoints) {
                startShapeObjPoints.sort(sortFunc);
                commonPoint = this.getCenterPointOnShape(startShapeObjPoints);
            } else {
                commonPoint = this.getIntersectionPointOfShapes(startShapeObj, endShapeObj, startShapeObjPoints, endShapeObjPoints);
            }

            if (typeof commonPoint === 'undefined') {
                return void 0;
            }

            if (!commonPoint.point.division) {
                pointObjWithOffset = this.getPointObjWithOffset(startShapeObj, commonPoint.point, 'centerPoint');
                startShapeObjPoints.push(pointObjWithOffset);

                pointObjWithOffset = this.getPointObjWithOffset(endShapeObj, commonPoint.point, 'centerPoint');
                endShapeObjPoints.push(pointObjWithOffset);

                commonPoint.pointOnShapes = [startShapeObj, endShapeObj];
            }

            this.centerPtObject = commonPoint;

            startShapeObjPoints.sort(sortFunc);
            endShapeObjPoints.sort(sortFunc);

            startPoint = this.getConsiderationPointOnShape(startShapeObj, startPt, startShapeObjPoints, commonPoint, 'startPoint');
            endPoint = this.getConsiderationPointOnShape(endShapeObj, endPt, endShapeObjPoints, commonPoint, 'endPoint');

            considerationPoints.push(startPoint, commonPoint, endPoint);

            this.considerationPoints = considerationPoints;

            return considerationPoints;

        },

        "drawAngleNotation": function() {
            var engine = this.engine,
                params = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(engine.dgtUI.model.dgtPopUpView.model.valuesForNotation.angleMark);

            this.notationView.removeNotation();

            if (this.showDirection) {
                params.showDirection = this.showDirection;
            }

            params.sources = this.considerationPoints;

            engine.perform('drawAngleMark', params);

            engine.eventListenerCanvas.notationFromShape = null;
            this.considerationPoints = [];
            this.startPt = null;
            this.endPt = null;
            this.startShapeObj = null;
            this.endShapeObj = null;
            this.regionPoints = [];
            this.pointsOnShapeObj = [];
            this.currentRegions = null;
            this.centerPtObject = null;
            this.via = null;
            this.viaPoint = null;
        }
    }, {
        "MIN_THRESHOLD": -0.0000003,
        "MAX_THRESHOLD": 0.0000003
    });
})(window.MathUtilities);
