/* globals window, _, $, geomFunctions  */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtShape = MathUtilities.Tools.Dgt.Models.DgtDrawable.extend({

        "functionCode": null,

        /**
        Seed will be the values from which the shape will be recreated. The seed are used for progeny of inherited shapes such as parallel lines, perpendicular lines etc
        **/

        "seed": null,

        //whenever plotted bring the shape to top
        "_alwaysOnTop": null,

        //when minimum points are added
        "satisfied": null,
        //anything is for now a simple dash
        "strokeStyle": null,



        "initialize": function() {
            var options = arguments[0];

            MathUtilities.Tools.Dgt.Models.DgtShape.__super__.initialize.apply(this, arguments);
            this.division = 'shape';

            this.equation.getLabelData().constraintDrag = MathUtilities.Tools.Dgt.Models.DgtDrawable.constraintDrag;
            if (options && options.thickness) {
                this.equation.setThickness(options.thickness);
            } else {
                this.equation.setThickness(3);
            }
            this.equation.setExtraThickness(true);
            if ('ontouchstart' in window) {
                this.equation.setDragHitThickness(40); // 40 is drag hit thickness for touch devices
            } else {
                this.equation.setDragHitThickness(10); //10 is drag hit thickness for non touch devices
            }
            this.equation.setParent(this);


            this.equation.setDraggable(true);

            this._karma = [];

            if (options && options.id) {
                this.id = options.id;
            } else {
                this.id = MathUtilities.Tools.Dgt.Models.DgtEngine.getIdForEntity(this);
            }

            this.redoData = this.equation.getData();

            this.onRelocate = _.bind(function(relocateData) {

                var seed, updateDataObject, relocateDataObject,
                    equation = relocateData.equation,
                    shape = equation.getParent();

                if (!shape) {
                    return;
                }

                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                updateDataObject.noBroadCast = false;

                if (shape.division === 'interior') {
                    seed = shape.getSeedClone();
                    relocateDataObject = relocateData.clone();
                    shape.saveDataOnRelocate(relocateDataObject);

                    updateDataObject.seed = seed;

                    shape.setSeed(updateDataObject);
                    shape.lastSeed = null;
                } else {
                    seed = this.getSeedClone();
                    relocateDataObject = relocateData.clone();
                    this.saveDataOnRelocate(relocateDataObject);

                    updateDataObject.seed = seed;

                    this.setSeed(updateDataObject);
                    this.lastSeed = null;
                }

            }, this);

            this.onDragBegin = _.bind(function(previousPosition, equation, event) {
                if (event.sessionTimestamp === this.getLastSelectTimestamp()) {
                    this.engine.deselectAll();
                    this.engine._select(this);
                }
            }, this);


        },

        "setStayBelow": function(senior) {
            if (!this._stayBelow) {
                this._stayBelow = [];
            }
            this._stayBelow.push(senior);
        },

        "getSubscript": function(str, finalStr) {
            var tempStr, i,
                strLen = str.length;
            for (i = 0; i < strLen; i++) {
                tempStr = str.slice(i, i + 1);
                finalStr += '\u2080'; // subscript zero
                finalStr.replace('0', tempStr);
            }
            return finalStr;
        },

        "init": function(species, engine) {
            var equationSpecie,
                equationData = this.equation,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            this.engine = engine;
            this.species = species;

            if (!DgtEngine.restoreKind) {
                DgtEngine.entityCount.shapes++;
            }
            this.setSerialNumber();
            equationData.depthLevel = this.serialNumber;
            if (species === 'ray') {
                equationData.setRayPolygon(true);
            }

            if (species === 'arc' || species === 'line' || species === 'circle') {
                equationData.setAutonomous(true);
            }

            this.satisfied = false;

            if (species === 'arc' || species === 'circle') {
                equationSpecie = 'curve';
            } else {
                equationSpecie = species === 'segment' || species === 'polygon' || species === 'ray' ? 'polygon' : 'plot';
            }
            equationData.setSpecie(equationSpecie);

            equationData.setClosedPolygon(species === 'polygon');
            equationData.setSmoothPolygon(false);

            this.functionCode = MathUtilities.Tools.Dgt.Models.DgtShape.getShapeFunctionCode(species);

            equationData.setFunctionCode(this.functionCode.functionCode);

            equationData.setParamVariableOrder(equationData.getSpecie() === 'plot' && species !== 'line' ? 2 : 1);

            equationData.setFunctionVariable('y');
            equationData.setParamVariable('x');
        },

        "incinerate": function() {
            if (this._incinerated) {
                return;
            }

            var engine = this.engine,
                equation = this.equation;

            //if marked as anchor in engine, remove it
            if (engine.anchor === this) {
                engine.anchor = null;
            }
            this._incinerated = true;

            this.creator.incinerate();
            this.trigger('incinerated', this);
            engine.plotter.removeEquation(equation);

            if (engine.anchor === this) {
                engine.anchor = null;
            }
            while (this._childrenRelationships.length > 0) {
                //it in turn removes itself thats why
                this._childrenRelationships[0].incinerate();
            }

            if (equation.getLabelData().labelObject) {
                this.setProperty('labelVisibility', false);
                engine.grid.removeDrawingObject(equation.getLabelData().labelObject);
            }
        },

        "onRelocate": null,

        "toString": function() {
            return 'Shape ' + (this._universe ? this.id + '*' : this.properties.labelText) + ' : ' + this.species;
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
            var i, interiorSourcePoints = [],
                interiorPlot = [],
                seed = this.equation.getConstants();

            this.patchSeed(seed, positionSeed);

            if (this.species === 'polygonInterior') {
                for (i = 0;; i++) {
                    if (typeof seed['x' + i] !== 'undefined' && seed['x' + i] !== null) {
                        interiorPlot.push(this.engine.grid._getCanvasPointCoordinates([seed['x' + i], seed['y' + i]]));
                        interiorSourcePoints.push([seed['x' + i], seed['y' + i]]);
                    } else {
                        break;
                    }
                }

                interiorSourcePoints.push(interiorSourcePoints[0]);
                this.equation.setPoints(interiorSourcePoints);

            } else if (this.species === 'segment' || this.species === 'ray') {
                this.equation.setPoints([
                    [seed.x1, seed.y1],
                    [seed.x2, seed.y2]
                ]);

                if (this.species === 'ray') {
                    this.updateRayInfinity();
                }
            } else if (this.species === 'angleMark') {
                this.equation.setPoints([
                    [seed.x1, seed.y1],
                    [seed.x2, seed.y2],
                    [seed.x3, seed.y3]
                ]);
            }
            return seed;
        },


        "patchSeed": function(seed, positionSeed) {
            var i, params, len;

            if (this.species === 'polygonInterior') {
                len = positionSeed.length;
                for (i = 0; i < len; i += 2) {
                    seed['x' + i / 2] = positionSeed[i];
                    seed['y' + i / 2] = positionSeed[i + 1];
                }
            } else {
                params = this.getPositionParamNames();
                len = params.length;
                for (i = 0; i < len; i += 2) {
                    seed[params[i]] = positionSeed[i];
                    seed[params[i + 1]] = positionSeed[i + 1];
                }

                MathUtilities.Tools.Dgt.Models.DgtShape.extraPolateSeed(this.species, seed);
            }
        },


        "getReverseSeed": function() {
            if (this.getCreationMethod() === 'natural') {
                //cant generate seed for natural ones
                return void 0;
            }

            var DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                newPosition, position, anchorData, seed;

            if (this.creator.anchor) {
                anchorData = MathUtilities.Tools.Dgt.Models.DgtEngine.getDataOfEntity(this.creator.anchor);
            }

            position = this.getPositionSeed();
            seed = this.getSeedClone();
            newPosition = DgtShape.transformPositionSeed(this.getCreationMethod(), position, anchorData, this.creator.getParamValues(), true);
            this.patchSeed(seed, newPosition);

            return seed;
        },

        "getSeedClone": function() {
            var seed = {};
            $.extend(seed, this.equation.getConstants());
            return seed;
        },

        "getPositionSeed": function(seed) {
            var params, arr, param, loopCtr;
            if (this.species === 'polygonInterior') {
                seed = this.getSeedClone();
                arr = [];
                loopCtr = 0;
                while (seed['x' + loopCtr] !== void 0 && seed['x' + loopCtr] !== null) {
                    arr.push(seed['x' + loopCtr], seed['y' + loopCtr]);
                    loopCtr++;
                }
            } else {
                params = this.getPositionParamNames();

                seed = seed || this.equation.getConstants();

                arr = [];
                for (param in params) {
                    arr.push(seed[params[param]]);
                }
            }
            return arr;
        },

        "getPositionParamNames": function() {
            return MathUtilities.Tools.Dgt.Models.DgtShape.positionParamMap[this.getParamCodeName()];
        },

        "getParamCodeName": function() {
            var codeName = this.species;
            if (codeName === 'circle') {
                codeName = this.getCreationMethod() === 'circleWithPoints' ? 'circleWithPoints' : 'circleWithRadius';
            }
            return codeName;
        },

        "update": function(updateData) {

            var params, DgtShape, parentData, i, anchorData, sourceCount, constants,
                DgtEngine,
                updateValue, updateLabel,
                newPosition, dx, dy, relocatedEntities,
                forceDrawing, modifyAttributes,
                DgtObject, updateDataObject,
                genesis = updateData.genesis,
                movedParent = updateData.caller;

            if (genesis === this || this.creator && !this.creator.isMature() ||
                movedParent && movedParent._incinerated) {
                return;
            }

            DgtObject = MathUtilities.Tools.Dgt.Models.DgtObject;
            DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape;

            newPosition = updateData.newPosition;
            dx = updateData.dx;
            dy = updateData.dy;
            relocatedEntities = updateData.relocatedEntities;
            forceDrawing = updateData.forceDrawing;
            modifyAttributes = updateData.modifyAttributes;

            if (modifyAttributes) {
                updateValue = modifyAttributes.indexOf('value') > -1;
                updateLabel = modifyAttributes.indexOf('label') > -1;
            } else {
                updateValue = true;
                updateLabel = false;
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

                if (updateLabel) {
                    this.updateLabelText(null, null, false);
                }

                if (updateValue) {

                    parentData = [];
                    sourceCount = this.creator.getSourceCount();

                    if (this.creator.anchor) {
                        anchorData = DgtEngine.getDataOfEntity(this.creator.anchor, movedParent, newPosition);
                    }

                    for (i = 0; i < sourceCount; i++) {
                        parentData[i] = DgtEngine.getDataOfEntity(this.creator.getSource(i), movedParent, newPosition);
                    }
                    params = this.creator.getParamValues();

                    if (this.division === 'interior') {
                        constants = DgtShape.getInteriorSeed(parentData, anchorData, this._creationMethod, params, this.species);
                    } else {
                        switch (this.species) {

                            case 'line':
                            case 'parabolaDirectrix':
                                constants = DgtShape.getLineSeed(parentData, anchorData, this._creationMethod, params);
                                break;

                            case 'ray':
                            case 'segment':
                                constants = DgtShape.getRaySeed(parentData, anchorData, this._creationMethod, params);
                                break;

                            case 'arc':
                                constants = DgtShape.getArcSeed(parentData, anchorData, this._creationMethod, params);
                                break;

                            case 'circle':
                                constants = DgtShape.getCircleSeed(parentData, anchorData, this._creationMethod, params);
                                break;

                            case 'ellipse':
                                constants = DgtShape.getEllipseSeed(parentData, anchorData, this._creationMethod, params);
                                break;

                            case 'parabola':
                                constants = DgtShape.getParabolaSeed(parentData, anchorData, this._creationMethod, params);
                                break;

                            case 'hyperbola':
                                constants = DgtShape.getHyperbolaSeed(parentData, anchorData, this._creationMethod, params);
                                if (constants && Math.abs(constants.b) < 1e-4) { // 1e-4 is threshold value
                                    constants.b = 0;
                                }
                                break;
                        }
                    }
                }
            }
            updateDataObject.seed = constants;
            updateDataObject.dx = NaN;
            updateDataObject.dy = NaN;
            updateDataObject.noBroadcast = null;
            this.setSeed(updateDataObject);

        },

        "isValidSeed": function(seed) {
            var looper, THRESHOLD_VALUE = 1e-10;

            switch (this.species) {
                case "ellipse":
                    if (Math.abs(seed.k - seed.g) < THRESHOLD_VALUE && Math.abs(seed.l - seed.h) < THRESHOLD_VALUE) {
                        return false;
                    }
                    return true;
                default:
                    for (looper in seed) {
                        if (!isFinite(seed[looper])) {
                            return false;
                        }
                    }
                    return true;
            }
        },

        "setSeed": function(updateData) {

            var coordinate, i, relocation, pathGroup, interiorSourcePoints = [],
                interiorPlot = [],
                lastSeedPosition, currentSeedPosition,
                drawPolygon, segment, hitSegment, childSegment, equationPoints = this.equation.getPoints(),
                updateValue, updateDataObject,
                seed = updateData.seed,
                genesis = updateData.genesis,
                caller = updateData.caller,
                dx = updateData.dx,
                dy = updateData.dy,
                relocatedEntities = updateData.relocatedEntities,
                noBroadcast = updateData.noBroadcast,
                forceDrawing = updateData.forceDrawing,
                modifyAttributes = updateData.modifyAttributes,
                dgtObject = MathUtilities.Tools.Dgt.Models.DgtObject;

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

            if (modifyAttributes) {
                updateValue = modifyAttributes.indexOf('value') > -1;
            } else {
                updateValue = true;
            }

            updateDataObject = dgtObject.createUpdateData();
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

                    if (this.isValidSeed(seed)) {

                        this.changeObjectVisibility(true, this.INVALID);

                        this.updateVisibleDomain();

                        switch (this.species) {
                            case 'polygonInterior':

                                for (i = 0;; i++) {
                                    if (typeof seed['x' + i] === 'number') {
                                        interiorPlot.push(this.engine.grid._getCanvasPointCoordinates([seed['x' + i], seed['y' + i]]));
                                        interiorSourcePoints.push([seed['x' + i], seed['y' + i]]);
                                    } else {
                                        //for predefined shapes since the 1st point is to be pushed in the end of the point array.
                                        interiorSourcePoints.push([seed.x0, seed.y0]);
                                        break;
                                    }
                                }


                                drawPolygon = !(equationPoints && interiorSourcePoints.length === equationPoints.length);
                                this.equation.setPoints(interiorSourcePoints);

                                if (this.properties.binaryInvisibility === 0) {

                                    if (this.getPath() && !drawPolygon) {
                                        segment = this.getPath().firstChild;
                                        for (childSegment = 0; childSegment < segment.segments.length; childSegment++) {
                                            coordinate = this.engine.grid._getCanvasPointCoordinates(interiorSourcePoints[childSegment]);
                                            if (segment.segments[childSegment]) {
                                                segment.segments[childSegment].point = coordinate;
                                            }
                                        }
                                    } else if (this.creator.isMature() && drawPolygon) {
                                        this.engine.grid.drawPolygon(this.equation);
                                    }

                                    this.equation.trigger('teleported', this.equation);
                                }

                                break;

                            case 'ray':
                            case 'segment':


                                this.equation.setPoints([
                                    [seed.x1, seed.y1],
                                    [seed.x2, seed.y2]
                                ]);

                                if (this.species === 'ray') {
                                    this.updateRayInfinity();
                                }


                                if (this.properties.binaryInvisibility === 0) {

                                    drawPolygon = true;

                                    if (this.species !== 'ray' && this.equation.getPathGroup()) {
                                        drawPolygon = false;
                                        segment = this.equation.getPathGroup().firstChild;
                                        hitSegment = this.equation.getPathGroup().lastChild;

                                        coordinate = this.engine.grid._getCanvasPointCoordinates([seed.x1, seed.y1]);

                                        if (segment.segments[0]) {
                                            segment.segments[0].point = coordinate;
                                        }

                                        if (hitSegment.segments[0]) {
                                            hitSegment.segments[0].point = coordinate;
                                        }
                                        coordinate = this.engine.grid._getCanvasPointCoordinates([seed.x2, seed.y2]);

                                        if (segment.segments[1]) {
                                            segment.segments[1].point = coordinate;
                                        }

                                        if (hitSegment.segments[1]) {
                                            hitSegment.segments[1].point = coordinate;
                                        }
                                    }

                                    if (this.creator.isMature() && drawPolygon) {
                                        this.engine.grid.drawPolygon(this.equation);
                                    }

                                    this.equation.trigger('teleported', this.equation);
                                }

                                break;

                            default:


                                if (this.properties.binaryInvisibility === 0) {
                                    //check if the entity is just relocated then dont redraw...
                                    if (this.checkShapeRedrawNeed() || forceDrawing & this.TRAVEL_FORCE) {
                                        this.redraw();
                                    } else {

                                        relocation = this.getSeedRelocation();
                                        pathGroup = this.getPath();
                                        if (!pathGroup) {
                                            this.redraw();
                                        } else if (relocation) {
                                            pathGroup.position.x += relocation[0];
                                            pathGroup.position.y += relocation[1];
                                            this.equation.trigger('teleported', this.equation);
                                        }

                                    }
                                }


                        }
                    } else {
                        this.changeObjectVisibility(false, this.INVALID);
                    }


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
                updateDataObject.caller = this;
                updateDataObject.dx = dx;
                updateDataObject.dy = dy;

                if (relocatedEntities.indexOf(this.creator) === -1 &&
                    (!(caller && this.creator.isPartOfThisRelation(caller)))) {
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

            this.trigger('drawing-updated');
        },

        "updateRayInfinity": function() {
            var RAY_INFINITY = 1e8,
                seed = this.seed,
                angle = Math.atan2(seed.y2 - seed.y1, seed.x2 - seed.x1);

            this.equation.getPoints()[2] = [Number(seed.x1) + RAY_INFINITY * Math.cos(-angle), Number(seed.y1) + RAY_INFINITY * Math.sin(angle)];
        },

        "redraw": function() {
            if (this.properties.binaryInvisibility === 0) {
                this.equation.trigger('change-equation');
            }
        },

        "checkShapeRedrawNeed": function() {
            if (!this.lastSeed) {
                return true;
            }
            var i, diff, len,
                propsToCheck = MathUtilities.Tools.Dgt.Models.DgtShape.shapeRedrawKeysMap[this.getParamCodeName()];

            if (!propsToCheck) {
                return true;
            }
            len = propsToCheck.length;
            for (i = 0; i < len; i++) {
                //this means definitely needs rendering
                if (!isFinite(this.lastSeed[propsToCheck[i]])) {
                    return true;
                }

                diff = this.lastSeed[propsToCheck[i]] - this.seed[propsToCheck[i]];
                if (Math.abs(diff) > 0.00001) {
                    return true;
                }
            }
            return false;
        },

        "updateVisibleDomain": function() {
            if (this.properties.binaryInvisibility > 0) {
                return;
            }
            var visibleDomain, i,
                bufferSpace = 0,
                t1, t2, t3, t4, x1, y1, x2, y2, d, minx, miny, maxx, maxy,
                seed = this.equation.getConstants(),
                positionSeed = this.getPositionSeed(),
                len = positionSeed.length;

            function flexDomain(x, y) {
                if (!visibleDomain) {
                    visibleDomain = {
                        "xmin": x,
                        "xmax": x,
                        "ymin": y,
                        "ymax": y
                    };
                    return;
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

            for (i = 0; i < len; i += 2) {
                flexDomain(positionSeed[i], positionSeed[i + 1]);
            }

            if (seed && this.species.indexOf('circle') > -1) {
                flexDomain(seed.a - seed.r, seed.b - seed.r);
                flexDomain(seed.a + seed.r, seed.b + seed.r);
            }
            if (seed && this.species.indexOf('ellipse') > -1) {
                d = seed.d;
                t1 = Math.atan(-(seed.b * Math.tan(d) / seed.a));
                t3 = Math.atan(-(seed.b * Math.tan(d) / seed.a)) + Math.PI;
                t2 = Math.atan(seed.b / (seed.a * Math.tan(d)));
                t4 = Math.atan(seed.b / (seed.a * Math.tan(d))) + Math.PI;
                x1 = seed.p + seed.a * Math.cos(t1) * Math.cos(d) - seed.b * Math.sin(t1) * Math.sin(d);
                y1 = seed.q + seed.a * Math.cos(t2) * Math.sin(d) + seed.b * Math.sin(t2) * Math.cos(d);
                x2 = seed.p + seed.a * Math.cos(t3) * Math.cos(d) - seed.b * Math.sin(t3) * Math.sin(d);
                y2 = seed.q + seed.a * Math.cos(t4) * Math.sin(d) + seed.b * Math.sin(t4) * Math.cos(d);
                minx = Math.min(x1, x2);
                miny = Math.min(y1, y2);
                maxx = Math.max(x1, x2);
                maxy = Math.max(y1, y2);
                flexDomain(minx, maxy);
                flexDomain(maxx, miny);

            }
            if (!visibleDomain) {
                return;
            }

            this.equation.setCurveMinima([visibleDomain.xmin, visibleDomain.ymin]);
            this.equation.setCurveMaxima([visibleDomain.xmax, visibleDomain.ymax]);


        },

        "getSeedRelocation": function() {
            if (!this.lastSeed) {
                return void 0;
            }
            var params = MathUtilities.Tools.Dgt.Models.DgtShape.shapeRelocationDiffKeys[this.species],
                dx, dy;
            if (!params) {
                return void 0;
            }
            dx = this.seed[params[0]] - this.lastSeed[params[0]];
            dy = this.seed[params[1]] - this.lastSeed[params[1]];
            return this.engine.grid._getCanvasDistance([dx, dy]);

        },

        "getEndPointsOfLatusRectum": function() {
            var distance = geomFunctions.distance2(this.seed.p, this.seed.q, this.seed.l, this.seed.m),
                latusRectumSeed = MathUtilities.Tools.Dgt.Models.DgtShape.getLineSeed([this.seed.l, this.seed.m], this.seed, 'parallel'),
                resultPoints = this._getAngleBisectorCoordinates(latusRectumSeed, [this.seed.p, this.seed.q], 2 * distance); // pq is focus.
            return resultPoints;
        },

        "getOffsetOnDirectrix": function() {
            var latusPoints = this.getEndPointsOfLatusRectum(),
                resultPoint1 = geomFunctions.getProjectionOfPointOnLine(this.seed.l, this.seed.m, this.seed.a, this.seed.b, this.seed.c),
                resultPoint2 = geomFunctions.getProjectionOfPointOnLine(latusPoints[0][0], latusPoints[0][1], this.seed.a, this.seed.b, this.seed.c),
                point = geomFunctions.getProjectionOfPointOnLine(latusPoints[1][0], latusPoints[1][1], this.seed.a, this.seed.b, this.seed.c),
                offset;

            offset = geomFunctions.getPointOffset(resultPoint1[0], resultPoint1[1], resultPoint2[0], resultPoint2[1], point[0], point[1]);
            return offset;
        },


        "getOffsetPointOnDirectrix": function(offset) {
            var latusPoints = this.getEndPointsOfLatusRectum(),
                resultPoint1 = geomFunctions.getProjectionOfPointOnLine(this.seed.l, this.seed.m, this.seed.a, this.seed.b, this.seed.c),
                resultPoint2 = geomFunctions.getProjectionOfPointOnLine(latusPoints[0][0], latusPoints[0][1], this.seed.a, this.seed.b, this.seed.c),
                point = geomFunctions.getPointPositionFromOffset(resultPoint1[0], resultPoint1[1], resultPoint2[0], resultPoint2[1], offset);
            return point;

        },
        "setShapeId": function() {
            var loopVar;
            this.id = this.type;
            for (loopVar = 0; loopVar < this.antecedents.length; loopVar++) {
                this.id += ',' + this.antecedents[loopVar].id;
            }
            this.engine.shapesMap[this.id] = this;
        },

        "getData": function() {
            return {
                "id": this.id,
                "creator": this.creator.id,
                "species": this.species,
                "properties": this.properties,
                "division": this.division,
                "type": this.type,
                "equation": this.equation.getData(),
                "serialNumber": this.serialNumber
            };
        },


        "setData": function(shapeJson, engine) {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            DgtEngine.restoreKind = DgtEngine.ACTION_SAVE_RESTORE;
            this.init(shapeJson.species, engine);
            this.id = shapeJson.id;
            this.properties = shapeJson.properties;
            this.division = shapeJson.division;
            this.type = shapeJson.type;

            this.equation.setData(shapeJson.equation);

            if (!isNaN(shapeJson.serialNumber)) {
                this.serialNumber = shapeJson.serialNumber;
                this.equation.depthLevel = shapeJson.serialNumber;
            }

            this.equation.getLabelData().isSaveRestoreData = true;

            DgtEngine.restoreKind = null;
            this.engine.acknowledgeEntity(this);
            this.equation.getLabelData().isSaveRestoreData = false;
            if (this.division === 'shape' && this.properties.isMarkedAnchor) {
                this.engine.anchor = this;
                this.engine._updateDrawableColor(this);
            }
        }

    }, {


        "positionParamMap": {
            "ray": ["x1", "y1", "x2", "y2"],
            "segment": ["x1", "y1", "x2", "y2"],
            "arc": ["x1", "y1", "x2", "y2", "x3", "y3"],
            "arcSegmentInterior": ["x1", "y1", "x2", "y2", "x3", "y3"],
            "line": ["x1", "y1", "x2", "y2"],
            "circleWithPoints": ["a", "b", "p", "q"],
            "circleWithRadius": ["a", "b", "p", "q"],
            "circleInterior": ["a", "b", "p", "q"],
            "circleWithMeasurement": ["a", "b", "p", "q"],
            "ellipse": ["i", "j", "k", "l", "g", "h"],
            "ellipseInterior": ["i", "j", "k", "l", "g", "h"],
            "parabola": ["p", "q", "l", "m"],
            "hyperbola": ["i", "j", "k", "l", "g", "h"],
            "angleMark": ["x1", "y1", "x2", "y2", "x3", "y3"]
        },


        //this object holds all the keys in a seed that needs to be same if the shape is not to be redrawn. If not mentioned in this that simply means always redrawn.
        "shapeRedrawKeysMap": {
            "circleWithPoints": ["r"],
            "circleWithRadius": ["r"],
            "circleInterior": ["r"],
            "circleWithMeasurement": ["r"],
            "ellipse": ["p", "q", "n", "m", "a", "f", "b", "d"],
            "ellipseInterior": ["p", "q", "n", "m", "a", "f", "b", "d"],
            "parabola": ["i", "j", "a", "b", "c"],
            "arc": ["a", "b", "r", "from", "via", "to"],
            "arcSegmentInterior": ["a", "b", "r", "from", "via", "to"],
            "hyperbola": ["p", "q", "n", "m", "a", "f", "b", "d", "s", "c"]
        },

        //values to pick up from seed in which the shape relocation will be reflected
        "shapeRelocationDiffKeys": {
            "circle": ["a", "b"],
            "circleInterior": ["a", "b"],
            "ellipse": ["i", "j"],
            "ellipseInterior": ["i", "j"],
            "parabola": ["p", "q"],
            "hyperbola": ["i", "j"]

        },

        //min and max values of offset for different shapes
        "shapeOffsetRange": {
            "segment": [0, 1],
            "ray": [0, 1],
            "line": [0, 1],
            "circle": [-Math.PI, Math.PI],
            "circleInterior": [-Math.PI, Math.PI],
            "ellipseInterior": [-Math.PI, Math.PI],
            "arc": [0, 1],
            "arcSectorInterior": [0, 4],
            "arcSegmentInterior": [0, 4],
            "parabola": [-Math.PI, Math.PI],
            "hyperbola": [-Math.PI, Math.PI],
            "ellipse": [-Math.PI, Math.PI]
        },
        "getSlope": function(x1, y1, x2, y2) {
            return Math.atan2(y2 - y1, x2 - x1);
        },

        "getLineSeed": function(parentData, anchorData, creationMethod, params) {
            var seed = {},
                target, DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                delta, line1, point, pt1, pt2, pt3, pt4, dist, vectorLine, vector1, vector2;

            switch (creationMethod) {
                case 'reflect':
                    line1 = geomFunctions.reflectLineAroundLine(parentData[0].a, parentData[0].b, parentData[0].c, anchorData.a, anchorData.b, anchorData.c);
                    seed.a = line1[0];
                    seed.b = line1[1];
                    seed.c = line1[2];
                    point = geomFunctions.reflectPointAroundLine(parentData[0].x1, parentData[0].y1, anchorData.a, anchorData.b, anchorData.c);
                    seed.x1 = point[0];
                    seed.y1 = point[1];
                    point = geomFunctions.reflectPointAroundLine(parentData[0].x2, parentData[0].y2, anchorData.a, anchorData.b, anchorData.c);
                    seed.x2 = point[0];
                    seed.y2 = point[1];
                    break;

                case 'translate':
                    pt1 = geomFunctions.translatePoint(parentData[0].x1, parentData[0].y1, params);
                    pt2 = geomFunctions.translatePoint(parentData[0].x2, parentData[0].y2, params);
                    seed.x1 = pt1[0];
                    seed.y1 = pt1[1];
                    seed.x2 = pt2[0];
                    seed.y2 = pt2[1];
                    seed.a = parentData[0].a;
                    seed.b = parentData[0].b;

                    if (params.coordinateSystem === 'cartesian') {
                        delta = [params.dx, params.dy];
                    } else {
                        delta = geomFunctions.rotatePoint(params.r, 0, 0, 0, params.angle, true);
                    }
                    seed.c = parentData[0].c - seed.b * delta[1] - seed.a * delta[0];
                    break;

                case 'rotate':
                    pt1 = geomFunctions.rotatePoint(parentData[0].x1, parentData[0].y1, anchorData[0], anchorData[1], params.angle, true);
                    pt2 = geomFunctions.rotatePoint(parentData[0].x2, parentData[0].y2, anchorData[0], anchorData[1], params.angle, true);
                    line1 = geomFunctions.rotateLine(parentData[0].a, parentData[0].b, parentData[0].c, anchorData[0], anchorData[1], params.angle, true);
                    seed.x1 = pt1[0];
                    seed.y1 = pt1[1];
                    seed.x2 = pt2[0];
                    seed.y2 = pt2[1];
                    seed.a = line1[0];
                    seed.b = line1[1];
                    seed.c = line1[2];
                    break;

                case 'dilate':
                    pt1 = geomFunctions.dilatePoint(parentData[0].x1, parentData[0].y1, anchorData[0], anchorData[1], params);
                    pt2 = geomFunctions.dilatePoint(parentData[0].x2, parentData[0].y2, anchorData[0], anchorData[1], params);
                    seed.x1 = pt1[0];
                    seed.y1 = pt1[1];
                    seed.x2 = pt2[0];
                    seed.y2 = pt2[1];
                    point = geomFunctions.dilateLine(parentData[0].a, parentData[0].b, parentData[0].c, anchorData[0], anchorData[1], params);
                    seed.a = parentData[0].a;
                    seed.b = parentData[0].b;
                    seed.c = -parentData[0].b * point[1] - parentData[0].a * point[0];
                    break;
                case 'parallel':
                    seed.a = anchorData.a;
                    seed.b = anchorData.b;
                    seed.c = -anchorData.b * parentData[0][1] - anchorData.a * parentData[0][0];
                    seed.x1 = parentData[0][0];
                    seed.y1 = parentData[0][1];

                    dist = geomFunctions.distance2(anchorData.x1, anchorData.y1, anchorData.x2, anchorData.y2);
                    point = geomFunctions.getPointAtADistance(seed.a, seed.b, seed.c, seed.x1, seed.y1, dist);
                    seed.x2 = point[0][0];
                    seed.y2 = point[0][1];
                    break;

                case 'perpendicular':
                    seed.a = -anchorData.b;
                    seed.b = anchorData.a;
                    seed.c = -anchorData.a * parentData[0][1] + anchorData.b * parentData[0][0];
                    seed.x1 = parentData[0][0];
                    seed.y1 = parentData[0][1];

                    vectorLine = DgtShape.getSlope(anchorData.x1, anchorData.y1, anchorData.x2, anchorData.y2);
                    dist = geomFunctions.distance2(anchorData.x1, anchorData.y1, anchorData.x2, anchorData.y2);
                    point = geomFunctions.getPointAtADistance(seed.a, seed.b, seed.c, seed.x1, seed.y1, dist);
                    vector1 = DgtShape.getSlope(point[0][0], point[0][1], seed.x1, seed.y1);
                    vector2 = DgtShape.getSlope(point[1][0], point[1][1], seed.x1, seed.y1);

                    target = geomFunctions.getArcDirection(vector1, vectorLine, vector2) > 0 ? point[0] : point[1];
                    seed.x2 = target[0];
                    seed.y2 = target[1];
                    break;
                case 'perpendicularBisector':

                    point = geomFunctions.midPoint2(parentData[0].x1, parentData[0].y1, parentData[0].x2, parentData[0].y2);
                    seed = MathUtilities.Tools.Dgt.Models.DgtShape.getLineSeed([point], parentData[0], 'perpendicular');
                    break;
                    //...... reflect, translate etc
                case 'parabolaDirectrix':
                    if (typeof parentData[0][0] !== 'undefined') {
                        pt3 = geomFunctions.dilatePoint(parentData[1][0], parentData[1][1], parentData[0][0], parentData[0][1], params);
                        pt4 = geomFunctions.rotatePoint(parentData[0][0], parentData[0][1], pt3[0], pt3[1], params.angle, true);
                    }
                    seed.a = pt3[1] - pt4[1];
                    seed.b = -(pt3[0] - pt4[0]);
                    seed.c = -seed.b * pt3[1] - seed.a * pt3[0];
                    seed.x1 = pt3[0];
                    seed.y1 = pt3[1];
                    seed.x2 = pt4[0];
                    seed.y2 = pt4[1];
                    break;
                default:
                    seed.a = parentData[0][1] - parentData[1][1];
                    seed.b = -(parentData[0][0] - parentData[1][0]);
                    seed.c = -seed.b * parentData[0][1] - seed.a * parentData[0][0];
                    seed.x1 = parentData[0][0];
                    seed.y1 = parentData[0][1];
                    seed.x2 = parentData[1][0];
                    seed.y2 = parentData[1][1];
            }
            seed.tag = new Date().getTime();
            return seed;
        },

        "getRaySeed": function(parentData, anchorData, creationMethod, params) {
            var seed = {},
                centre, pt1, pt2, sortedPoints,
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;

            switch (creationMethod) {
                case 'translate':
                    pt1 = geomFunctions.translatePoint(parentData[0].x1, parentData[0].y1, params);
                    pt2 = geomFunctions.translatePoint(parentData[0].x2, parentData[0].y2, params);
                    seed.x1 = pt1[0];
                    seed.y1 = pt1[1];
                    seed.x2 = pt2[0];
                    seed.y2 = pt2[1];
                    break;

                case 'rotate':
                    pt1 = geomFunctions.rotatePoint(parentData[0].x1, parentData[0].y1, anchorData[0], anchorData[1], params.angle, true);
                    pt2 = geomFunctions.rotatePoint(parentData[0].x2, parentData[0].y2, anchorData[0], anchorData[1], params.angle, true);
                    seed.x1 = pt1[0];
                    seed.y1 = pt1[1];
                    seed.x2 = pt2[0];
                    seed.y2 = pt2[1];
                    break;

                case 'reflect':
                    pt1 = geomFunctions.reflectPointAroundLine(parentData[0].x1, parentData[0].y1, anchorData.a, anchorData.b, anchorData.c);
                    pt2 = geomFunctions.reflectPointAroundLine(parentData[0].x2, parentData[0].y2, anchorData.a, anchorData.b, anchorData.c);
                    seed.x1 = pt1[0];
                    seed.y1 = pt1[1];
                    seed.x2 = pt2[0];
                    seed.y2 = pt2[1];
                    break;

                case 'dilate':
                    pt1 = geomFunctions.dilatePoint(parentData[0].x1, parentData[0].y1, anchorData[0], anchorData[1], params);
                    pt2 = geomFunctions.dilatePoint(parentData[0].x2, parentData[0].y2, anchorData[0], anchorData[1], params);
                    seed.x1 = pt1[0];
                    seed.y1 = pt1[1];
                    seed.x2 = pt2[0];
                    seed.y2 = pt2[1];
                    break;

                case 'bisector':
                    centre = geomFunctions.getTriangleIncentre(parentData[0][0], parentData[0][1], parentData[1][0], parentData[1][1], parentData[2][0], parentData[2][1]);

                    //for collinear points
                    //in case of collinear points incenter of triangle is same as middle point,
                    //so third point is rotated by -90 to get alternative point for incenter in this case
                    if (DgtEngine.comparePointsWithThreshold({
                            "x": centre[0],
                            "y": centre[1]
                        }, {
                            "x": parentData[1][0],
                            "y": parentData[1][1]
                        }) === true) {
                        centre = geomFunctions.rotatePoint(parentData[2][0], parentData[2][1], centre[0], centre[1], -90, true);
                    }
                    seed.x2 = centre[0];
                    seed.y2 = centre[1];

                    //first is the origin of ray
                    seed.x1 = parentData[1][0];
                    seed.y1 = parentData[1][1];
                    break;

                case 'rayBisector':
                case 'segmentBisector':
                    sortedPoints = DgtEngine.getPointsToFindAngle(parentData[0], parentData[1]);
                    centre = geomFunctions.getTriangleIncentre(sortedPoints[0].x, sortedPoints[0].y, sortedPoints[1].x, sortedPoints[1].y, sortedPoints[2].x, sortedPoints[2].y);

                    //for collinear points
                    //in case of collinear points incenter of triangle is same as middle point,
                    //so third point is rotated by -90 to get alternative point for incenter in this case
                    if (DgtEngine.comparePointsWithThreshold({
                            "x": centre[0],
                            "y": centre[1]
                        }, sortedPoints[1]) === true) {
                        centre = geomFunctions.rotatePoint(sortedPoints[2].x, sortedPoints[2].y, centre[0], centre[1], -90, true);
                    }

                    seed.x2 = centre[0];
                    seed.y2 = centre[1];

                    //first is the origin of ray
                    seed.x1 = sortedPoints[1].x;
                    seed.y1 = sortedPoints[1].y;
                    break;

                default:
                    seed.x1 = parentData[0][0];
                    seed.y1 = parentData[0][1];
                    seed.x2 = parentData[1][0];
                    seed.y2 = parentData[1][1];
            }

            geomFunctions.getLineABC(seed.x1, seed.y1, seed.x2, seed.y2, seed);

            return seed;
        },

        "getCircleSeed": function(parentData, anchorData, creationMethod, params) {

            /*
            a, b - center of circle
            r - radius of circle
            p, q - second point of the circle.
            This is used and kept so that it is possible to reverse trace the parent.
            In case of segment, these points are kept as reference when adding radius to the center.
            */
            var r, a, b, pt, p, q;

            switch (creationMethod) {

                case 'reflect':
                    pt = geomFunctions.reflectPointAroundLine(parentData[0].a, parentData[0].b, anchorData.a, anchorData.b, anchorData.c);
                    a = pt[0];
                    b = pt[1];
                    r = parentData[0].r;

                    pt = geomFunctions.reflectPointAroundLine(parentData[0].p, parentData[0].q, anchorData.a, anchorData.b, anchorData.c);
                    p = pt[0];
                    q = pt[1];
                    break;

                case 'circleWithRadius':
                    a = parentData[0][0];
                    b = parentData[0][1];
                    r = parentData[1];
                    p = a + r;
                    q = b;
                    break;

                case 'circleWithSegment':
                    a = parentData[0][0];
                    b = parentData[0][1];
                    r = geomFunctions.distance2(parentData[1].x1, parentData[1].y1, parentData[1].x2, parentData[1].y2);
                    p = a + r;
                    q = b;
                    break;

                case 'rotate':
                    pt = geomFunctions.rotatePoint(parentData[0].a, parentData[0].b, anchorData[0], anchorData[1], params.angle, true);
                    a = pt[0];
                    b = pt[1];
                    r = parentData[0].r;

                    pt = geomFunctions.rotatePoint(parentData[0].p, parentData[0].q, anchorData[0], anchorData[1], params.angle, true);
                    p = pt[0];
                    q = pt[1];
                    break;

                case 'translate':
                    pt = geomFunctions.translatePoint(parentData[0].a, parentData[0].b, params);
                    a = pt[0];
                    b = pt[1];
                    r = parentData[0].r;

                    pt = geomFunctions.translatePoint(parentData[0].p, parentData[0].q, params);
                    p = pt[0];
                    q = pt[1];
                    break;

                case 'dilate':
                    pt = geomFunctions.dilatePoint(parentData[0].a, parentData[0].b, anchorData[0], anchorData[1], params);
                    a = pt[0];
                    b = pt[1];
                    r = parentData[0].r * params.ratio;

                    pt = geomFunctions.dilatePoint(parentData[0].p, parentData[0].q, anchorData[0], anchorData[1], params);
                    p = pt[0];
                    q = pt[1];
                    break;
                    //with points
                default:
                    a = parentData[0][0];
                    b = parentData[0][1];
                    r = geomFunctions.distance2(parentData[0][0], parentData[0][1], parentData[1][0], parentData[1][1]);
                    p = parentData[1][0];
                    q = parentData[1][1];
            }

            return {
                "a": a,
                "b": b,
                "r": r,
                "p": p,
                "q": q
            };
        },

        "getEllipseSeed": function(parentData, anchorData, creationMethod, params) {

            var seed = {},
                i, j, k, l, g, h,
                pt1 = [],
                pt2 = [],
                pt3 = [],
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape;

            switch (creationMethod) {

                case 'reflect':
                    pt1 = geomFunctions.reflectPointAroundLine(parentData[0].i, parentData[0].j, anchorData.a, anchorData.b, anchorData.c);
                    pt2 = geomFunctions.reflectPointAroundLine(parentData[0].k, parentData[0].l, anchorData.a, anchorData.b, anchorData.c);
                    pt3 = geomFunctions.reflectPointAroundLine(parentData[0].g, parentData[0].h, anchorData.a, anchorData.b, anchorData.c);
                    i = pt1[0];
                    j = pt1[1];
                    k = pt2[0];
                    l = pt2[1];
                    g = pt3[0];
                    h = pt3[1];
                    break;

                case 'translate':
                    pt1 = geomFunctions.translatePoint(parentData[0].i, parentData[0].j, params);
                    pt2 = geomFunctions.translatePoint(parentData[0].k, parentData[0].l, params);
                    pt3 = geomFunctions.translatePoint(parentData[0].g, parentData[0].h, params);
                    i = pt1[0];
                    j = pt1[1];
                    k = pt2[0];
                    l = pt2[1];
                    g = pt3[0];
                    h = pt3[1];
                    break;

                case 'rotate':
                    pt1 = geomFunctions.rotatePoint(parentData[0].i, parentData[0].j, anchorData[0], anchorData[1], params.angle, true);
                    pt2 = geomFunctions.rotatePoint(parentData[0].k, parentData[0].l, anchorData[0], anchorData[1], params.angle, true);
                    pt3 = geomFunctions.rotatePoint(parentData[0].g, parentData[0].h, anchorData[0], anchorData[1], params.angle, true);
                    i = pt1[0];
                    j = pt1[1];
                    k = pt2[0];
                    l = pt2[1];
                    g = pt3[0];
                    h = pt3[1];
                    break;
                    //...... all transform
                case 'dilate':
                    pt1 = geomFunctions.dilatePoint(parentData[0].i, parentData[0].j, anchorData[0], anchorData[1], params);
                    pt2 = geomFunctions.dilatePoint(parentData[0].k, parentData[0].l, anchorData[0], anchorData[1], params);
                    pt3 = geomFunctions.dilatePoint(parentData[0].g, parentData[0].h, anchorData[0], anchorData[1], params);
                    i = pt1[0];
                    j = pt1[1];
                    k = pt2[0];
                    l = pt2[1];
                    g = pt3[0];
                    h = pt3[1];
                    break;

                default:
                    i = parentData[0][0];
                    j = parentData[0][1];
                    k = parentData[1][0];
                    l = parentData[1][1];
                    g = parentData[2][0];
                    h = parentData[2][1];

            }

            seed.i = i;
            seed.j = j;
            seed.k = k;
            seed.l = l;
            seed.g = g;
            seed.h = h;

            DgtShape.extraPolateSeed('ellipse', seed);

            return seed;
        },


        "getParabolaSeed": function(parentData, anchorData, creationMethod, params) {
            //params p, q, a, b, c   refer https://www.desmos.com/calculator/ffmxfom5hj
            /*
             * 1 - vertex
             * 2 - focus
             *
             * $\frac{\left(ax+by+c\right)^2}{a^2+b^2}=\left(x-p\right)^2+\left(y-q\right)^2$
             *
             */

            var l, m, p, q, pt1, pt2, seed = {},
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape;

            switch (creationMethod) {
                case 'reflect':
                    pt1 = geomFunctions.reflectPointAroundLine(parentData[0].l, parentData[0].m, anchorData.a, anchorData.b, anchorData.c);
                    pt2 = geomFunctions.reflectPointAroundLine(parentData[0].p, parentData[0].q, anchorData.a, anchorData.b, anchorData.c);
                    l = pt1[0];
                    m = pt1[1];
                    p = pt2[0];
                    q = pt2[1];
                    break;

                case 'rotate':
                    pt1 = geomFunctions.rotatePoint(parentData[0].l, parentData[0].m, anchorData[0], anchorData[1], params.angle, true);
                    pt2 = geomFunctions.rotatePoint(parentData[0].p, parentData[0].q, anchorData[0], anchorData[1], params.angle, true);
                    l = pt1[0];
                    m = pt1[1];
                    p = pt2[0];
                    q = pt2[1];
                    break;

                case 'translate':
                    pt1 = geomFunctions.translatePoint(parentData[0].l, parentData[0].m, params);
                    pt2 = geomFunctions.translatePoint(parentData[0].p, parentData[0].q, params);
                    l = pt1[0];
                    m = pt1[1];
                    p = pt2[0];
                    q = pt2[1];
                    break;

                case 'dilate':
                    pt1 = geomFunctions.dilatePoint(parentData[0].l, parentData[0].m, anchorData[0], anchorData[1], params);
                    pt2 = geomFunctions.dilatePoint(parentData[0].p, parentData[0].q, anchorData[0], anchorData[1], params);
                    l = pt1[0];
                    m = pt1[1];
                    p = pt2[0];
                    q = pt2[1];
                    break;

                default:
                    l = parentData[1][0];
                    m = parentData[1][1];
                    p = parentData[0][0];
                    q = parentData[0][1];
            }
            //pq is vertex
            seed.p = p;
            seed.q = q;
            seed.l = l;
            seed.m = m;

            DgtShape.extraPolateSeed('parabola', seed);

            return seed;
        },

        "getHyperbolaSeed": function(parentData, anchorData, creationMethod, params) {

            var i, j, k, l, g, h, pt1, pt2, pt3,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                seed = {};


            switch (creationMethod) {
                case 'reflect':
                    pt1 = geomFunctions.reflectPointAroundLine(parentData[0].i, parentData[0].j, anchorData.a, anchorData.b, anchorData.c);
                    pt2 = geomFunctions.reflectPointAroundLine(parentData[0].k, parentData[0].l, anchorData.a, anchorData.b, anchorData.c);
                    pt3 = geomFunctions.reflectPointAroundLine(parentData[0].g, parentData[0].h, anchorData.a, anchorData.b, anchorData.c);
                    i = pt1[0];
                    j = pt1[1];
                    k = pt2[0];
                    l = pt2[1];
                    g = pt3[0];
                    h = pt3[1];
                    break;

                case 'rotate':
                    pt1 = geomFunctions.rotatePoint(parentData[0].i, parentData[0].j, anchorData[0], anchorData[1], params.angle, true);
                    pt2 = geomFunctions.rotatePoint(parentData[0].k, parentData[0].l, anchorData[0], anchorData[1], params.angle, true);
                    pt3 = geomFunctions.rotatePoint(parentData[0].g, parentData[0].h, anchorData[0], anchorData[1], params.angle, true);
                    i = pt1[0];
                    j = pt1[1];
                    k = pt2[0];
                    l = pt2[1];
                    g = pt3[0];
                    h = pt3[1];
                    break;

                case 'translate':
                    pt1 = geomFunctions.translatePoint(parentData[0].i, parentData[0].j, params);
                    pt2 = geomFunctions.translatePoint(parentData[0].k, parentData[0].l, params);
                    pt3 = geomFunctions.translatePoint(parentData[0].g, parentData[0].h, params);
                    i = pt1[0];
                    j = pt1[1];
                    k = pt2[0];
                    l = pt2[1];
                    g = pt3[0];
                    h = pt3[1];
                    break;

                case 'dilate':
                    pt1 = geomFunctions.dilatePoint(parentData[0].i, parentData[0].j, anchorData[0], anchorData[1], params);
                    pt2 = geomFunctions.dilatePoint(parentData[0].k, parentData[0].l, anchorData[0], anchorData[1], params);
                    pt3 = geomFunctions.dilatePoint(parentData[0].g, parentData[0].h, anchorData[0], anchorData[1], params);
                    i = pt1[0];
                    j = pt1[1];
                    k = pt2[0];
                    l = pt2[1];
                    g = pt3[0];
                    h = pt3[1];
                    break;

                default:
                    i = parentData[0][0];
                    j = parentData[0][1];
                    k = parentData[1][0];
                    l = parentData[1][1];
                    g = parentData[2][0];
                    h = parentData[2][1];
            }

            seed.i = i;
            seed.j = j;
            seed.k = k;
            seed.l = l;
            seed.g = g;
            seed.h = h;

            DgtShape.extraPolateSeed('hyperbola', seed);

            return seed;
        },


        "transformPositionSeed": function(transformCulture, positionSeed, anchorData, params, reverse) {
            var newSeed = [],
                i, temp, reverseParams = {},
                len = positionSeed.length;

            for (i = 0; i < len; i += 2) {
                switch (transformCulture) {
                    case 'rotate':
                        temp = geomFunctions.rotatePoint(positionSeed[i], positionSeed[i + 1], anchorData[0], anchorData[1], params.angle, true, reverse);
                        break;

                    case 'reflect':
                        temp = geomFunctions.reflectPointAroundLine(positionSeed[i], positionSeed[i + 1], anchorData.a, anchorData.b, anchorData.c);
                        break;

                    case 'translate':
                        temp = geomFunctions.translatePoint(positionSeed[i], positionSeed[i + 1], params, reverse);
                        break;

                    case 'dilate':
                        if (reverse) {
                            reverseParams.ratio = 1 / params.ratio;
                        }
                        temp = geomFunctions.dilatePoint(positionSeed[i], positionSeed[i + 1], anchorData[0], anchorData[1], reverseParams);
                        break;

                    default:
                        newSeed.push(positionSeed[i], positionSeed[i + 1]);
                        break;
                }
                if (temp) {
                    newSeed.push(temp[0], temp[1]);
                }
            }
            return newSeed;
        },



        "getArcSeed": function(parentData, anchorData, creationMethod, params) {
            var x1, y1, x2, y2, x3, y3, pt1, pt2, pt3, tempAngle, tempPoint, center,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                seed = {};

            switch (creationMethod) {
                case 'translate':
                    pt1 = geomFunctions.translatePoint(parentData[0].x1, parentData[0].y1, params);
                    pt2 = geomFunctions.translatePoint(parentData[0].x2, parentData[0].y2, params);
                    pt3 = geomFunctions.translatePoint(parentData[0].x3, parentData[0].y3, params);
                    x1 = pt1[0];
                    x2 = pt2[0];
                    x3 = pt3[0];
                    y1 = pt1[1];
                    y2 = pt2[1];
                    y3 = pt3[1];
                    break;


                case 'rotate':
                    pt1 = geomFunctions.rotatePoint(parentData[0].x1, parentData[0].y1, anchorData[0], anchorData[1], params.angle, true);
                    pt2 = geomFunctions.rotatePoint(parentData[0].x2, parentData[0].y2, anchorData[0], anchorData[1], params.angle, true);
                    pt3 = geomFunctions.rotatePoint(parentData[0].x3, parentData[0].y3, anchorData[0], anchorData[1], params.angle, true);
                    x1 = pt1[0];
                    x2 = pt2[0];
                    x3 = pt3[0];
                    y1 = pt1[1];
                    y2 = pt2[1];
                    y3 = pt3[1];
                    break;

                case 'dilate':
                    pt1 = geomFunctions.dilatePoint(parentData[0].x1, parentData[0].y1, anchorData[0], anchorData[1], params);
                    pt2 = geomFunctions.dilatePoint(parentData[0].x2, parentData[0].y2, anchorData[0], anchorData[1], params);
                    pt3 = geomFunctions.dilatePoint(parentData[0].x3, parentData[0].y3, anchorData[0], anchorData[1], params);
                    x1 = pt1[0];
                    x2 = pt2[0];
                    x3 = pt3[0];
                    y1 = pt1[1];
                    y2 = pt2[1];
                    y3 = pt3[1];
                    break;

                case 'reflect':
                    pt1 = geomFunctions.reflectPointAroundLine(parentData[0].x1, parentData[0].y1, anchorData.a, anchorData.b, anchorData.c);
                    pt2 = geomFunctions.reflectPointAroundLine(parentData[0].x2, parentData[0].y2, anchorData.a, anchorData.b, anchorData.c);
                    pt3 = geomFunctions.reflectPointAroundLine(parentData[0].x3, parentData[0].y3, anchorData.a, anchorData.b, anchorData.c);
                    x1 = pt1[0];
                    x2 = pt2[0];
                    x3 = pt3[0];
                    y1 = pt1[1];
                    y2 = pt2[1];
                    y3 = pt3[1];
                    break;

                case 'withCircle':
                    if (parentData[0].r) {
                        center = [parentData[0].a, parentData[0].b];
                    } else {
                        center = [parentData[0][0], parentData[0][1]];
                    }
                    tempAngle = geomFunctions.angleBetweenPoints(parentData[1][0], parentData[1][1], center[0], center[1], parentData[2][0], parentData[2][1]);
                    if (tempAngle < 0) {
                        tempAngle += 2 * Math.PI;
                    }
                    tempPoint = geomFunctions.rotatePoint(parentData[1][0], parentData[1][1], center[0], center[1], tempAngle / 2);
                    x1 = parentData[1][0];
                    y1 = parentData[1][1];
                    x2 = tempPoint[0];
                    y2 = tempPoint[1];
                    x3 = parentData[2][0];
                    y3 = parentData[2][1];
                    break;
                default:
                    x1 = parentData[0][0];
                    y1 = parentData[0][1];
                    x2 = parentData[1][0];
                    y2 = parentData[1][1];
                    x3 = parentData[2][0];
                    y3 = parentData[2][1];

            }
            seed.x1 = x1;
            seed.x2 = x2;
            seed.x3 = x3;

            seed.y1 = y1;
            seed.y2 = y2;
            seed.y3 = y3;

            DgtShape.extraPolateSeed('arc', seed);

            return seed;

        },
        "_getInteriorSeedForGivenType": function(parentData, anchorData, creationMethod, params, species) {

            var seed, DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape;
            switch (species) {

                case 'circleInterior':
                    if (parentData.length === 1 && (creationMethod === 'shapeInteriorWithPoints' || creationMethod === 'interiorWithShape')) {
                        parentData = parentData[0];
                        parentData = [
                            [parentData.a, parentData.b],
                            [parentData.p, parentData.q]
                        ];
                    }
                    seed = DgtShape.getCircleSeed(parentData, anchorData, creationMethod, params, species);
                    DgtShape.extraPolateSeed(species, seed);
                    break;
                case 'ellipseInterior':
                    //to check if the parentData is an object ie the seed of ellipse or an array ie the three points.
                    if (parentData.length === 1 && (creationMethod === 'shapeInteriorWithPoints' || creationMethod === 'interiorWithShape')) {
                        parentData = parentData[0];
                        parentData = [
                            [parentData.i, parentData.j],
                            [parentData.k, parentData.l],
                            [parentData.g, parentData.h]
                        ];
                    }
                    seed = DgtShape.getEllipseSeed(parentData, anchorData, creationMethod, params, species);
                    break;
                case 'arcSegmentInterior':
                    if (creationMethod === 'interiorWithShape') {
                        parentData = parentData[0];
                        parentData = [
                            [parentData.x1, parentData.y1],
                            [parentData.x2, parentData.y2],
                            [parentData.x3, parentData.y3]
                        ];
                    }
                    seed = DgtShape.getArcSeed(parentData, anchorData, creationMethod, params, species);
                    break;
            }
            return seed;
        },

        "getInteriorSeed": function(parentData, anchorData, creationMethod, params, species) {
            var seed = {},
                i, ctr, parentDataSeed, parentDataLength, pt,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                isWithShape = species !== 'polygonInterior';
            if (parentData) {
                parentDataLength = parentData.length;
            }
            if (parentDataLength === 1) {
                parentDataSeed = parentData[0];
            }

            switch (creationMethod) {
                case 'interiorWithShape':
                case 'shapeInteriorWithPoints':
                    seed = DgtShape._getInteriorSeedForGivenType(parentData, anchorData, creationMethod, params, species);
                    break;

                case 'reflect':
                    if (isWithShape) {
                        seed = DgtShape._getInteriorSeedForGivenType(parentData, anchorData, creationMethod, params, species);
                    } else {
                        for (ctr = 0; ctr < parentDataLength; ctr++) {

                            for (i = 0;; i = i + 2) {
                                if (isFinite(parentDataSeed['x' + i / 2])) {
                                    pt = geomFunctions.reflectPointAroundLine(parentDataSeed['x' + i / 2], parentDataSeed['y' + i / 2], anchorData.a, anchorData.b, anchorData.c); //rotated pt x
                                    seed['x' + i / 2] = pt[0];
                                    seed['y' + i / 2] = pt[1];
                                    continue;
                                }
                                break;
                            }
                        }
                    }

                    break;
                case 'rotate':
                    if (isWithShape) {
                        seed = DgtShape._getInteriorSeedForGivenType(parentData, anchorData, creationMethod, params, species);
                    } else {
                        for (ctr = 0; ctr < parentDataLength; ctr++) {

                            for (i = 0;; i = i + 2) {
                                if (isFinite(parentDataSeed['x' + i / 2])) {
                                    pt = geomFunctions.rotatePoint(parentDataSeed['x' + i / 2], parentDataSeed['y' + i / 2], anchorData[0], anchorData[1], params.angle, true); //rotated pt x
                                    seed['x' + i / 2] = pt[0];
                                    seed['y' + i / 2] = pt[1];
                                    continue;
                                }
                                break;
                            }
                        }
                    }
                    break;
                case 'translate':
                    if (isWithShape) {
                        seed = DgtShape._getInteriorSeedForGivenType(parentData, anchorData, creationMethod, params, species);
                    } else {
                        for (ctr = 0; ctr < parentDataLength; ctr++) {

                            for (i = 0;; i = i + 2) {
                                if (isFinite(parentDataSeed['x' + i / 2])) {
                                    pt = geomFunctions.translatePoint(parentDataSeed['x' + i / 2], parentDataSeed['y' + i / 2], params);
                                    seed['x' + i / 2] = pt[0];
                                    seed['y' + i / 2] = pt[1];
                                    continue;
                                }
                                break;
                            }
                        }
                    }
                    break;

                case 'dilate':
                    if (isWithShape) {
                        seed = DgtShape._getInteriorSeedForGivenType(parentData, anchorData, creationMethod, params, species);
                    } else {
                        for (ctr = 0; ctr < parentDataLength; ctr++) {

                            for (i = 0;; i = i + 2) {
                                if (isFinite(parentDataSeed['x' + i / 2])) {
                                    pt = geomFunctions.dilatePoint(parentDataSeed['x' + i / 2], parentDataSeed['y' + i / 2], anchorData[0], anchorData[1], params);
                                    seed['x' + i / 2] = pt[0];
                                    seed['y' + i / 2] = pt[1];
                                    continue;
                                }
                                break;
                            }
                        }
                    }
                    break;
                    //with points
                default:
                    for (i = 0; i < parentData.length; i++) {
                        seed['x' + i] = parentData[i][0];
                        seed['y' + i] = parentData[i][1];
                    }
            }
            if (seed.x0 === seed['x' + (i - 1)] && seed.y0 === seed['y' + (i - 1)]) {
                delete seed['x' + (i - 1)];
                delete seed['y' + (i - 1)];
            }
            return seed;
        },

        "extraPolateSeed": function(specie, seed) {
            var r, circumCentre, a, b, angFrom, angTo, angVia;
            switch (specie) {
                case 'line':
                case 'segment':
                case 'ray':
                    geomFunctions.getLineABC(seed.x1, seed.y1, seed.x2, seed.y2, seed);
                    break;

                case 'circleInterior':
                    seed.from = -Math.PI;
                    seed.to = Math.PI;
                    seed.via = 0;
                    seed.r = geomFunctions.distance2(seed.a, seed.b, seed.p, seed.q);
                    break;

                case 'circle':
                    seed.r = geomFunctions.distance2(seed.a, seed.b, seed.p, seed.q);
                    break;

                case 'arcSegmentInterior':
                case 'arc':
                    circumCentre = geomFunctions.getTriangleCircumCentre(seed.x1, seed.y1, seed.x2, seed.y2, seed.x3, seed.y3);
                    a = circumCentre[0];
                    b = circumCentre[1];

                    r = geomFunctions.distance2(seed.x1, seed.y1, circumCentre[0], circumCentre[1]);
                    angFrom = Math.atan2(seed.y1 - circumCentre[1], seed.x1 - circumCentre[0]);
                    angVia = Math.atan2(seed.y2 - circumCentre[1], seed.x2 - circumCentre[0]);
                    angTo = Math.atan2(seed.y3 - circumCentre[1], seed.x3 - circumCentre[0]);

                    seed.from = angFrom;
                    seed.to = angTo;
                    seed.via = angVia;

                    seed.r = r;
                    seed.a = a;
                    seed.b = b;
                    break;

                case 'ellipse':
                case 'ellipseInterior':
                    seed.p = (seed.i + seed.k) / 2;
                    seed.q = (seed.j + seed.l) / 2;
                    seed.n = Math.sqrt(Math.pow(seed.k - seed.g, 2) + Math.pow(seed.l - seed.h, 2));
                    seed.m = Math.sqrt(Math.pow(seed.i - seed.g, 2) + Math.pow(seed.j - seed.h, 2));
                    seed.a = Math.abs(seed.m + seed.n) / 2;
                    seed.f = Math.sqrt(Math.pow(seed.i - seed.k, 2) + Math.pow(seed.j - seed.l, 2)) / 2;
                    seed.b = Math.sqrt(Math.abs(Math.pow(seed.a, 2) - Math.pow(seed.f, 2)));
                    seed.d = Math.atan2(seed.l - seed.j, seed.k - seed.i);

                    seed.s = Math.sin(seed.d);
                    seed.c = Math.cos(seed.d);
                    break;

                case 'parabola':
                    seed.i = 2 * seed.p - seed.l;
                    seed.j = 2 * seed.q - seed.m;
                    seed.a = -(seed.i - seed.l);
                    seed.b = seed.m - seed.j;
                    seed.c = -(seed.b * seed.j + seed.a * seed.i);
                    break;

                case 'hyperbola':
                    seed.p = (seed.i + seed.k) / 2;
                    seed.q = (seed.j + seed.l) / 2;
                    seed.n = Math.sqrt(Math.pow(seed.k - seed.g, 2) + Math.pow(seed.l - seed.h, 2));
                    seed.m = Math.sqrt(Math.pow(seed.i - seed.g, 2) + Math.pow(seed.j - seed.h, 2));
                    seed.a = Math.abs(seed.m - seed.n) / 2;
                    seed.f = Math.sqrt(Math.pow(seed.i - seed.k, 2) + Math.pow(seed.j - seed.l, 2)) / 2;
                    seed.b = Math.sqrt(Math.abs(Math.pow(seed.f, 2) - Math.pow(seed.a, 2)));
                    seed.d = Math.atan2(seed.l - seed.j, seed.k - seed.i);
                    seed.s = Math.sin(seed.d);
                    seed.c = Math.cos(seed.d);
                    break;
            }
        },

        "getShapeFunctionCode": function(type) {
            var functionCodes = {};
            switch (type) {
                case 'parallelLine':
                case 'perpendicularLine':
                case 'line':
                    functionCodes.functionCode = "var x1, x2, y1, y2, a, b, c; x1 = plot.minX; x2 = plot.maxX; y1 = plot.minY; y2 = plot.maxY; a = Math.abs(constants.a) < 1e-6 ? 0 : constants.a; b = Math.abs(constants.b) < 1e-6 ? 0 : constants.b; c = constants.c; var lines = [ [] ]; var segment = lines[0]; if (a === 0 || b == 0) { if (a === 0) { segment.push(x1, -c / b, x2, -c / b); } else if (b === 0) { segment.push(-c / a, y1, -c / a, y2); } else { return; } } else { segment.push(x1, -(c + a * x1) / b, x2, -(c + a * x2) / b); } return lines;";
                    break;

                case 'circleInterior':
                case 'arc':
                    functionCodes.functionCode = "var r = constants['r'], a = constants['a'],                    b = constants['b'],from = constants['from'], via = constants['via'], to = constants['to'];return geomFunctions.createArc(r,from,via,to,a,b); ";
                    break;

                case 'arcSectorInterior':
                    functionCodes.functionCode = "var r = constants['r'], a = constants['a'],                    b = constants['b'],from = constants['from'], via = constants['via'], to = constants['to'],curve,x1 = constants['x1'],y1=constants['y1'];curve = geomFunctions.createArc(r,from,via,to,a,b);if(!curve || (curve[0] && curve[0].length === 0)){return;} curve.push([a,b]);curve.push([x1,y1]); return curve;";
                    break;

                case 'arcSegmentInterior':
                    functionCodes.functionCode = "var r = constants['r'], a = constants['a'],                    b = constants['b'],from = constants['from'], via = constants['via'], to = constants['to'],curve,x1 = constants['x1'],y1=constants['y1'];curve = geomFunctions.createArc(r,from,via,to,a,b);if(!curve || (curve[0] && curve[0].length === 0)){return;} curve.push([x1,y1]); return curve;";
                    break;

                case 'ray':
                case 'segment':
                case 'polygon':
                    break;

                case 'circle':
                case 'circleWithPoints':
                    functionCodes.functionCode = "var r = constants['r'], a = constants['a'],                    b = constants['b'];return geomFunctions.createArc(r,-Math.PI,0,Math.PI,a,b);";
                    break;

                case 'ellipseInterior':
                    functionCodes.functionCodeA = "return (((raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=(constants['s']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(1))+((raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=(constants['c']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(1)))";
                    functionCodes.functionCodeB = "return (((2)*-(constants['q'])*(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=(constants['s']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+((2)*-(constants['q'])*(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=(constants['c']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+((constants['x'])*(2)*(constants['c'])*(constants['s'])*(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+((constants['x'])*(-2)*(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(constants['c'])*(constants['s']))+(-(constants['p'])*(2)*(constants['c'])*(constants['s'])*(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+(-(constants['p'])*(-2)*(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(constants['c'])*(constants['s'])))";
                    functionCodes.functionCodeC = "return (-((raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+((raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=(constants['c']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=((constants['x'])+-(constants['p'])),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+((raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=(constants['s']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=((constants['x'])+-(constants['p'])),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+((raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=(constants['s']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=-(constants['q']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+((raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=(constants['c']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(raised=0,absBase=0,sign=0,num=-(constants['q']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+((constants['x'])*-(constants['q'])*(2)*(constants['c'])*(constants['s'])*(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+((constants['x'])*-(constants['q'])*(-2)*(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(constants['c'])*(constants['s']))+(-(constants['p'])*-(constants['q'])*(2)*(constants['c'])*(constants['s'])*(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow)))+(-(constants['p'])*-(constants['q'])*(-2)*(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,Math.pow(num,pow)):Math.pow(num,pow))*(constants['c'])*(constants['s'])))";
                    // falls through
                case 'ellipse':
                    functionCodes.functionCode = "var solution,a = ((((raised=0,absBase=0,sign=0,num=((constants['s'])*(1)),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))/(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow)))+((raised=0,absBase=0,sign=0,num=((constants['c'])*(1)),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))/(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))))),b=((((((constants['s'])*(1))*(((constants['c'])*param)+((constants['c'])*-(constants['p']))+((constants['s'])*-(constants['q'])))*(2))/(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow)))+((((constants['c'])*(1))*(((constants['s'])*(param*-1))+((constants['s'])*(constants['p']))+((constants['c'])*-(constants['q'])))*(2))/(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))))), c=(((-1)+((raised=0,absBase=0,sign=0,num=(((constants['c'])*param)+((constants['c'])*-(constants['p']))+((constants['s'])*-(constants['q']))),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))/(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow)))+((raised=0,absBase=0,sign=0,num=(((constants['s'])*(param*-1))+((constants['s'])*(constants['p']))+((constants['c'])*-(constants['q']))),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))/(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow)))));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;";
                    break;

                case 'parabola':
                    functionCodes.functionCode = "var solution,a = (((-1)+((Math.pow(((constants['b'])*(1)),(2)))/((Math.pow((constants['a']),(2)))+(Math.pow((constants['b']),(2))))))),b=((-((2)*-(constants['m']))+((((constants['b'])*(1))*(((constants['a'])*param)+(constants['c']))*(2))/((Math.pow((constants['a']),(2)))+(Math.pow((constants['b']),(2))))))), c=((-(Math.pow((param+-(constants['l'])),(2)))+-(Math.pow(-(constants['m']),(2)))+((Math.pow((((constants['a'])*param)+(constants['c'])),(2)))/((Math.pow((constants['a']),(2)))+(Math.pow((constants['b']),(2)))))));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution; ";
                    break;

                case 'hyperbola':
                    functionCodes.functionCode = "var solution,a = ((((raised=0,absBase=0,sign=0,num=((constants['s'])*(1)),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))/(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow)))+-((raised=0,absBase=0,sign=0,num=((constants['c'])*(1)),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))/(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))))),b=((((((constants['s'])*(1))*(((constants['c'])*param)+((constants['c'])*-(constants['p']))+((constants['s'])*-(constants['q'])))*(2))/(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow)))+-((((constants['c'])*(1))*(((constants['s'])*(param*-1))+((constants['s'])*(constants['p']))+((constants['c'])*-(constants['q'])))*(2))/(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))))), c=(((-1)+((raised=0,absBase=0,sign=0,num=(((constants['c'])*param)+((constants['c'])*-(constants['p']))+((constants['s'])*-(constants['q']))),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))/(raised=0,absBase=0,sign=0,num=(constants['a']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow)))+-((raised=0,absBase=0,sign=0,num=(((constants['s'])*(param*-1))+((constants['s'])*(constants['p']))+((constants['c'])*-(constants['q']))),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow))/(raised=0,absBase=0,sign=0,num=(constants['b']),pow=(2),num===0&&pow===0?NaN:pow%1!==0?(raised=1/pow,absBase=Math.abs(num),sign=num>=0?1:-1,raised%2===0 && sign ===-1?Math.pow(num,pow):sign*Math.pow(absBase,pow)):Math.pow(num,pow)))));solution = []; a !== 0 ? (solution[0] = (-b + Math.sqrt(b*b - 4*a*c))/(2*a),solution[1] = (-b - Math.sqrt(b*b - 4*a*c))/(2*a)) :(solution[0] = -c/b,solution[1] = solution[0]); return solution;";
                    break;
            }
            return functionCodes;
        },

        "getClosestPointOnShape": function(specie, point, seed) {
            var pt, angle, x1, y1, x2, y2, slope = [],
                choices = [],
                line1, line2, looper, distance,
                lastChoice,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                points1, cal2, cal3, i, j, segmentData, MIN_DISTANCE = 10e10,
                points, intersections = [],
                interiorSourcePoints = [],
                min, flag, a, b, c, d, intPoint, dist1, dist2, v, w, d1, delta0, deltai, cal1, unity1, unity2, param1, param2, coorArr = [],
                paramArr = [],
                ONE_THIRD = 1 / 3;

            switch (specie) {
                case 'line':
                case 'ray':
                case 'segment':
                    return geomFunctions.getProjectionOfPointOnLine(point[0], point[1], seed.a, seed.b, seed.c);

                case 'circle':
                case 'arc': // for updateCustomLabelPosition of arc.
                case 'circleInterior':
                    pt = [seed.a + seed.r, seed.b];
                    angle = Math.PI * 2 - geomFunctions.angleBetweenPoints(point[0], point[1], seed.a, seed.b, pt[0], pt[1], false);
                    return geomFunctions.rotatePoint(pt[0], pt[1], seed.a, seed.b, angle, false);

                case 'arcSectorInterior':
                case 'arcSegmentInterior':
                    pt = [seed.a + seed.r, seed.b];
                    angle = Math.PI * 2 - geomFunctions.angleBetweenPoints(point[0], point[1], seed.a, seed.b, pt[0], pt[1], false);

                    if (specie === 'arcSegmentInterior') {
                        //segments from centre
                        line1 = geomFunctions.getLineABC(seed.x1, seed.y1, seed.x3, seed.y3);
                    } else {
                        //segments from centre
                        line1 = geomFunctions.getLineABC(seed.x1, seed.y1, seed.a, seed.b);
                        line2 = geomFunctions.getLineABC(seed.x3, seed.y3, seed.a, seed.b);
                    }

                    choices.push(geomFunctions.rotatePoint(pt[0], pt[1], seed.a, seed.b, angle, false),
                        geomFunctions.getProjectionOfPointOnLine(point[0], point[1], line1.a, line1.b, line1.c));

                    if (line2) {
                        choices.push(geomFunctions.getProjectionOfPointOnLine(point[0], point[1], line2.a, line2.b, line2.c));
                    }

                    for (looper in choices) {
                        distance = geomFunctions.distance2(point[0], point[1], choices[looper][0], choices[looper][1]);
                        if (distance < MIN_DISTANCE) {
                            lastChoice = looper;
                            MIN_DISTANCE = distance;
                        }
                    }
                    return choices[lastChoice];

                case 'polygonInterior':
                    for (j = 0;; j++) {
                        if (typeof seed['x' + j] === 'number') {
                            interiorSourcePoints.push([seed['x' + j], seed['y' + j]]);
                        } else {
                            break;
                        }
                    }
                    for (i = 0; i < interiorSourcePoints.length; i++) {
                        if (i === interiorSourcePoints.length - 1) {
                            segmentData = DgtShape.getLineSeed([interiorSourcePoints[i], interiorSourcePoints[0]]);
                        } else {
                            segmentData = DgtShape.getLineSeed([interiorSourcePoints[i], interiorSourcePoints[i + 1]]);
                        }
                        pt = geomFunctions.getProjectionOfPointOnLine(point[0], point[1], segmentData.a, segmentData.b, segmentData.c);
                        if (MathUtilities.Tools.Dgt.Models.DgtEngine.isOnShape(segmentData, 'segment', pt)) {
                            distance = geomFunctions.distance2(pt[0], pt[1], point[0], point[1]);
                            if (distance < MIN_DISTANCE) {
                                MIN_DISTANCE = distance;
                                points = pt;
                            }
                        }
                    }
                    min = MIN_DISTANCE;
                    for (i = 0;; i++) {
                        if (typeof seed['x' + i] === 'number') {
                            distance = geomFunctions.distance2(seed['x' + i], seed['y' + i], point[0], point[1]);
                            if (distance < min) {
                                min = distance;
                                pt = [seed['x' + i], seed['y' + i]];
                            }
                        } else {
                            break;
                        }
                    }
                    if (min < MIN_DISTANCE) {
                        points = pt;
                    }
                    return points;

                case 'hyperbola':
                    x1 = seed.a * seed.c - seed.b * seed.s + seed.p;
                    y1 = seed.a * seed.s + seed.b * seed.c + seed.q;
                    slope[0] = -(seed.p - x1) / (seed.q - y1);
                    x2 = -(seed.a * seed.c) - seed.b * seed.s + seed.p;
                    y2 = -(seed.a * seed.s) + seed.b * seed.c + seed.q;
                    slope[1] = -(seed.p - x2) / (seed.q - y2);
                    slope[2] = (point[1] - seed.j) / (point[0] - seed.i);
                    slope[3] = (point[1] - seed.l) / (point[0] - seed.k);
                    for (i = 0; i < slope.length; i++) {
                        points = DgtShape.interceptOfLineAndHyperbola(slope[i], seed, point[0], point[1]);
                        intersections[i * 2] = points[0];
                        intersections[i * 2 + 1] = points[1];
                    }
                    min = MIN_DISTANCE;
                    for (i = 0; i < intersections.length; i++) {
                        if (!isNaN(intersections[i][0])) {
                            distance = geomFunctions.distance2(intersections[i][0], intersections[i][1], point[0], point[1]);
                            if (distance < min) {
                                min = distance;
                                flag = i;
                            }
                        }
                    }
                    return intersections[flag];

                case 'ellipse':
                case 'ellipseInterior':
                    a = Math.sqrt(Math.pow(point[0] - seed.i, 2) + Math.pow(point[1] - seed.j, 2));
                    b = Math.sqrt(Math.pow(point[0] - seed.k, 2) + Math.pow(point[1] - seed.l, 2));
                    c = Math.sqrt(Math.pow(seed.k - seed.i, 2) + Math.pow(seed.l - seed.j, 2));
                    pt = [];

                    pt[0] = (a * seed.k + b * seed.i + c * point[0]) / (a + b + c);
                    pt[1] = (a * seed.l + b * seed.j + c * point[1]) / (a + b + c);
                    intPoint = MathUtilities.Tools.Dgt.Models.DgtShape.intersectionOfLineAndEllipse(seed, point[0], point[1], pt[0], pt[1]);
                    if (intPoint) {
                        dist1 = geomFunctions.distance2(point[0], point[1], intPoint[0][0], intPoint[0][1]);
                        dist2 = geomFunctions.distance2(point[0], point[1], intPoint[1][0], intPoint[1][1]);
                        if (dist1 < dist2) {
                            return intPoint[0];
                        }
                        return intPoint[1];
                    }
                    break;

                case 'parabola':

                    v = point[1] - seed.q;
                    w = point[0] - seed.p;
                    a = Math.sqrt(Math.pow(seed.i - seed.p, 2) + Math.pow(seed.j - seed.q, 2));
                    points1 = [];
                    d = Math.atan((seed.j - seed.q) / (seed.i - seed.p));
                    if (seed.p - seed.i <= 0) {
                        d += Math.PI;
                    }
                    c = 2 * a - v * Math.sin(d) - w * Math.cos(d);
                    d1 = w * Math.sin(d) - v * Math.cos(d);
                    delta0 = -(3 * a * c);
                    /* Mathematical formula. Please check `https://www.desmos.com/calculator/2w42fqyf1y` for reference */
                    deltai = 27 * Math.pow(a, 2) * d1;
                    cal1 = Math.sqrt(Math.abs(Math.pow(deltai, 2) - 4 * Math.pow(delta0, 3)));
                    cal2 = (deltai + cal1) / 2;
                    if (cal2 < 0) {
                        unity1 = Math.pow(Math.abs(cal2), ONE_THIRD);
                        unity1 = -unity1;
                    } else {
                        unity1 = Math.pow(cal2, ONE_THIRD);
                    }
                    cal3 = (deltai - cal1) / 2;
                    if (cal3 < 0) {
                        unity2 = Math.pow(Math.abs(cal3), ONE_THIRD);
                        unity2 = -unity2;
                    } else {
                        unity2 = Math.pow(cal3, ONE_THIRD);
                    }
                    param1 = -(unity1 + delta0 / unity1) / (3 * a);
                    param2 = -(unity2 + delta0 / unity2) / (3 * a);
                    paramArr = [param1, param1 - 0.12, param2, param2 - 0.12];
                    for (i = 0; i < paramArr.length; i++) {
                        coorArr[0] = a * Math.pow(paramArr[i], 2) * Math.cos(d) - 2 * a * paramArr[i] * Math.sin(d) + seed.p;
                        coorArr[1] = a * Math.pow(paramArr[i], 2) * Math.sin(d) + 2 * a * paramArr[i] * Math.cos(d) + seed.q;
                        points1[i] = [coorArr[0], coorArr[1]];
                    }
                    slope[0] = (points1[0][1] - point[1]) / (points1[0][0] - point[0]);
                    slope[1] = (points1[2][1] - point[1]) / (points1[2][0] - point[0]);
                    slope[2] = -(points1[1][0] - points1[0][0]) / (points1[1][1] - points1[0][1]);
                    slope[3] = -(points1[3][0] - points1[2][0]) / (points1[3][1] - points1[2][1]);
                    for (i = 0; i < slope.length; i++) {
                        points = DgtShape.interceptOfLineAndParabola(slope[i], seed, point[0], point[1]);
                        intersections[i * 2] = points[0];
                        intersections[i * 2 + 1] = points[1];
                    }
                    min = MIN_DISTANCE;
                    for (i = 0; i < intersections.length; i++) {
                        if (!isNaN(intersections[i][0])) {
                            distance = geomFunctions.distance2(intersections[i][0], intersections[i][1], point[0], point[1]);
                            if (distance < min) {
                                min = distance;
                                flag = i;
                            }
                        }
                    }
                    return intersections[flag];
            }
        },

        "interceptOfLineAndParabola": function(slope, seed, interceptX, interceptY) {
            var q1, p1, a, b, c, d, param1, param2, pointX1, pointY1, points, pointX2, pointY2, a1;
            a = Math.sqrt(Math.pow(seed.i - seed.p, 2) + Math.pow(seed.j - seed.q, 2));
            q1 = seed.q - interceptY;
            p1 = seed.p - interceptX;
            d = Math.atan((seed.j - seed.q) / (seed.i - seed.p));
            if (seed.p - seed.i <= 0) {
                d += Math.PI;
            }
            a1 = a * (Math.sin(d) - slope * Math.cos(d));
            b = a * (Math.cos(d) + slope * Math.sin(d));
            c = q1 - slope * p1;
            param1 = (-b - Math.sqrt(Math.pow(b, 2) - a1 * c)) / a1;
            param2 = (-b + Math.sqrt(Math.pow(b, 2) - a1 * c)) / a1;
            pointX1 = a * Math.pow(param1, 2) * Math.cos(d) - 2 * a * param1 * Math.sin(d) + seed.p;
            pointY1 = a * Math.pow(param1, 2) * Math.sin(d) + 2 * a * param1 * Math.cos(d) + seed.q;
            pointX2 = a * Math.pow(param2, 2) * Math.cos(d) - 2 * a * param2 * Math.sin(d) + seed.p;
            pointY2 = a * Math.pow(param2, 2) * Math.sin(d) + 2 * a * param2 * Math.cos(d) + seed.q;
            points = [
                [pointX1, pointY1],
                [pointX2, pointY2]
            ];
            return points;
        },

        "interceptOfLineAndHyperbola": function(slope, seed, interceptX, interceptY) {

            var v = interceptY - slope * interceptX - seed.q,
                l = -Math.pow(seed.a, 2) * Math.pow(seed.s, 2) + Math.pow(seed.b, 2) * Math.pow(seed.c, 2),
                m = Math.pow(seed.b, 2) * Math.pow(seed.s, 2) - Math.pow(seed.a, 2) * Math.pow(seed.c, 2),
                n = Math.sin(2 * seed.d) * (Math.pow(seed.a, 2) + Math.pow(seed.b, 2)),
                a = l + Math.pow(slope, 2) * m + slope * n,
                b = slope * v * m - seed.p * l + (v * n - slope * n * seed.p) / 2,
                c = l * Math.pow(seed.p, 2) + m * Math.pow(v, 2) - v * n * seed.p - Math.pow(seed.a, 2) * Math.pow(seed.b, 2),
                d = Math.pow(b, 2) - a * c,
                pointX1 = (-b - Math.sqrt(d)) / a,
                pointY1 = slope * (pointX1 - interceptX) + interceptY,
                pointX2 = (-b + Math.sqrt(d)) / a,
                pointY2 = slope * (pointX2 - interceptX) + interceptY;

            return [
                [pointX1, pointY1],
                [pointX2, pointY2]
            ];
        },
        "intersectionOfLineAndEllipse": function(ellipseSeed, x1, y1, x2, y2) {
            //(x1,y1) & (x2,y2) are two points on line.
            var point = [
                    [],
                    []
                ],
                c1 = Math.cos(-ellipseSeed.d),
                s1 = Math.sin(-ellipseSeed.d),
                m = (y1 - y2) / (x1 - x2),
                c = y1 - m * x1,
                q = -(c - ellipseSeed.q),
                e = ellipseSeed.b * ellipseSeed.b * (s1 * s1) + ellipseSeed.a * ellipseSeed.a * (c1 * c1),
                d = ellipseSeed.b * ellipseSeed.b * (c1 * c1) + ellipseSeed.a * ellipseSeed.a * (s1 * s1),
                f = Math.sin(-(2 * ellipseSeed.d)) * (ellipseSeed.a * ellipseSeed.a - ellipseSeed.b * ellipseSeed.b),
                a2 = d + m * m * e + m * f,
                b2 = -((ellipseSeed.p * d + m * q * e + (q + ellipseSeed.p * m) * f / 2)),
                c2 = d * ellipseSeed.p * ellipseSeed.p + e * q * q + f * ellipseSeed.p * q - ellipseSeed.a * ellipseSeed.a * (ellipseSeed.b * ellipseSeed.b);
            point[0].push((-b2 - Math.sqrt(b2 * b2 - a2 * c2)) / a2);
            point[0].push(m * point[0][0] + c);
            point[1].push((-b2 + Math.sqrt(b2 * b2 - a2 * c2)) / a2);
            point[1].push(m * point[1][0] + c);
            return point;
        },
        "getPointOnPolygonFromOffset": function(seed, offset) {
            var segIndex, offset1, points = [],
                position;
            segIndex = Math.floor(offset);
            offset1 = offset - segIndex;
            if (typeof seed['x' + (segIndex + 1)] === 'number') {
                points.push([seed['x' + segIndex], seed['y' + segIndex]], [seed['x' + (segIndex + 1)], seed['y' + (segIndex + 1)]]);
            } else {
                points.push([seed['x' + segIndex], seed['y' + segIndex]], [seed.x0, seed.y0]);
            }
            position = geomFunctions.getPointPositionFromOffset(points[0][0], points[0][1], points[1][0], points[1][1], offset1);
            return position;
        },
        "getOffsetForPointOnShape": function(specie, point, seed) {
            var pt, offset, i, j, interiorSourcePoints = [],
                choices = [],
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                looper,
                lineSeed, arcLength, tempLength;
            switch (specie) {
                case 'segment':
                case 'line':
                case 'ray':
                    return geomFunctions.getPointOffset(seed.x1, seed.y1, seed.x2, seed.y2, point[0], point[1]);

                case 'circle':
                case 'circleInterior':
                    pt = [seed.a + seed.r, seed.b];
                    offset = Math.PI * 2 - geomFunctions.angleBetweenPoints(point[0], point[1], seed.a, seed.b, pt[0], pt[1], false);
                    return offset;

                case 'arcSectorInterior':
                case 'arcSegmentInterior':
                    choices.push(seed);
                    if (specie === 'arcSegmentInterior') {
                        choices.push({
                            "x1": seed.x3,
                            "y1": seed.y3,
                            "x2": seed.x1,
                            "y2": seed.y1
                        });
                    } else {
                        choices.push({
                            "x1": seed.x3,
                            "y1": seed.y3,
                            "x2": seed.a,
                            "y2": seed.b
                        }, {
                            "x1": seed.a,
                            "y1": seed.b,
                            "x2": seed.x1,
                            "y2": seed.y1
                        });
                    }

                    if (!DgtEngine.isOnShape(choices[0], 'arc', point)) {
                        //rest of the choices are segments
                        /*

                            Range is as 0-1 Arc
                            1 -2 Segment1
                            2-3 segment2

                            */
                        for (looper = 1; looper < choices.length; looper++) {
                            if (DgtEngine.isOnShape(choices[looper], 'segment', point)) {
                                return Number(looper) + geomFunctions.getPointOffset(choices[looper].x1, choices[looper].y1, choices[looper].x2, choices[looper].y2, point[0], point[1]);
                            }
                        }

                    }
                    //My master told me to go ahead if i come here
                    // falls through
                case 'arc':
                    arcLength = geomFunctions.getArcAngle(seed) / 360 * 2 * Math.PI * seed.r;
                    tempLength = geomFunctions.smallerAngleBetweenPoints(seed.x1, seed.y1, seed.a, seed.b, point[0], point[1], true) / 360 * 2 * Math.PI * seed.r;
                    offset = Math.abs(tempLength / arcLength);
                    return offset;

                case 'parabola':
                    offset = geomFunctions.getParameterOfParabola(seed.i, seed.j, seed.p, seed.q, point[0], point[1]);
                    geomFunctions.traceConsole(offset);
                    return offset;

                case 'hyperbola':
                    offset = geomFunctions.getParameterOfHyperbola(seed.p, seed.q, seed.b, seed.d, point[0], point[1], seed.k, seed.l, seed.i, seed.j);
                    geomFunctions.traceConsole(offset);
                    return offset;

                case 'ellipse':
                case 'ellipseInterior':
                    offset = geomFunctions.getParameterOfEllipse(seed.a, seed.p, seed.q, seed.b, seed.d, point[0], point[1], seed.k, seed.l, seed.i, seed.j);
                    geomFunctions.traceConsole(offset);
                    return offset;

                case 'polygonInterior':
                    for (j = 0;; j++) {
                        if (typeof seed['x' + j] === 'number') {
                            interiorSourcePoints.push([seed['x' + j], seed['y' + j]]);
                        } else {
                            break;
                        }
                    }
                    for (i = 0; i < interiorSourcePoints.length; i++) {
                        if (i === interiorSourcePoints.length - 1) {
                            lineSeed = MathUtilities.Tools.Dgt.Models.DgtShape.getLineSeed([interiorSourcePoints[i], interiorSourcePoints[0]]);
                        } else {
                            lineSeed = MathUtilities.Tools.Dgt.Models.DgtShape.getLineSeed([interiorSourcePoints[i], interiorSourcePoints[i + 1]]);
                        }
                        if (DgtEngine.roundOff(lineSeed.a * point[0] + lineSeed.b * point[1] + lineSeed.c, 5) === 0 && // point is ON Line
                            DgtEngine.isOnShape(lineSeed, 'segment', point)) { // point is on segment
                            offset = i + geomFunctions.getPointOffset(lineSeed.x1, lineSeed.y1, lineSeed.x2, lineSeed.y2, point[0], point[1]);
                            break;
                        }
                    }
                    return offset;
            }
        },

        "updateShapeParentPoints": function(shape) {
            if (shape.getCreationMethod() !== 'natural') {
                return;
            }
        }

    });
})(window.MathUtilities);
