/* globals _, $, window, geomFunctions   */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtPoint = MathUtilities.Tools.Dgt.Models.DgtDrawable.extend({

        "equation": null,
        "_stateOfMind": null,
        "undoRedoData": [],
        "_menteeRelations": [],
        "firstCoordinateSet": null,
        "onPlotComplete": null,

        "toString": function() {
            return this._universe ? this.id + '*' : this.id + ':' + this.properties.labelText;
        },

        "initialize": function() {
            var options = arguments[0],
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                bootstrapCoordinates,
                createPointCoordinate = MathUtilities.Tools.Dgt.Models.DgtPoint.createPointCoordinate;
            MathUtilities.Tools.Dgt.Models.DgtPoint.__super__.initialize.apply(this, arguments);
            this.division = 'point';
            if (!(options && options.coords)) {
                if (!createPointCoordinate ||
                    !MathUtilities.Components.Utils.Models.BrowserCheck.isMobile && DgtEngine.isAccessible) {
                    if (MathUtilities.Tools.Dgt.Models.DgtUiModel.fromKeyEvent) {
                        bootstrapCoordinates = DgtEngine.canvasCenter;
                    } else {
                        bootstrapCoordinates = createPointCoordinate || DgtEngine.defaultPointPosition;
                    }
                    MathUtilities.Tools.Dgt.Models.DgtPoint.createPointCoordinate = bootstrapCoordinates;

                } else {
                    bootstrapCoordinates = createPointCoordinate;
                    bootstrapCoordinates = [bootstrapCoordinates[0], bootstrapCoordinates[1]];
                }
            } else {
                bootstrapCoordinates = options.coords;
                bootstrapCoordinates = [bootstrapCoordinates[0], bootstrapCoordinates[1]];
            }

            if (options && options.universe) {
                this._universe = options.universe;
            }
            this.firstCoordinateSet = false;

            this.equation.setLatex('BLIND');
            this.equation.setSpecie('point');
            this.onPlotComplete = _.bind(function() {
                this.updateGrowthPhase();
            }, this);
            this.equation.on('plotComplete', this.onPlotComplete);
            this.equation.setExtraThickness(true);
            this._isDEBUG = false;

            if (this._isDEBUG) {
                this._consumeID();
            }

            //made it draggable for polygon hit area from the beginning
            this.equation.setDraggable(true);
            this._maturity = "adult";

            this._incinerated = false;
            if ('ontouchstart' in window) {
                this.equation.setDragHitThickness(40);
            } else {
                this.equation.setDragHitThickness(10);
            }
            this.equation.setThickness(3);

            this.equation.getLabelData().constraintDrag = MathUtilities.Tools.Dgt.Models.DgtDrawable.constraintDrag;
            this.equation.setBlind(true);

            this.equation.setPoints([bootstrapCoordinates]);

            this.visible = true;
            this.equation.setParent(this);

            this.species = 'point';
            this._stateOfMind = 'restless';


            this.onDragBegin = _.bind(function onDragBegin(previousPosition, equation, event) {
                if (this.engine.getOperationMode() !== 'select') {
                    return;
                }

                if (event.sessionTimestamp === this.getLastSelectTimestamp()) {
                    this.engine.deselectAll();
                    this.engine._select(this);
                }

                this.oldPosition = previousPosition;

            }, this);

            this.onRelocate = _.bind(function onRelocate(relocateData) {
                if (this.engine.selectionSteal) {
                    this.engine.selectionSteal.rollOut(this);
                    return;
                }
                if (this.engine.getOperationMode() !== 'select') {
                    return;
                }

                var saveRelocateDataObject;

                saveRelocateDataObject = relocateData.clone();

                this.saveDataOnRelocate(saveRelocateDataObject);

            }, this);
        },

        "getSourceParent": function() {
            return this.creator ? this.creator.getSource() : null;
        },

        "getAnchorParent": function() {
            return this.creator ? this.creator.getAnchor() : null;
        },

        "settle": function(x, y) {
            var newPoint, updateDataObject, willUpdate = [];
            if (this.visible) {
                this.equation.setDraggable(true);
                this.setStateOfMind('serene');

                newPoint = this.engine.grid._getGraphPointCoordinates([x, y]);

                MathUtilities.Tools.Dgt.Models.DgtPoint.setNextBootstrapCoordinate([newPoint[0], newPoint[1]]);
                this.setCoordinate(newPoint);

                /*
                    predefined shapes appear distorted since relocatedEntities.willUpdate
                    is not generated while drawing shapes hence doing a test travel and
                    generating the willUpdate and then updating the entities again..
                */
                updateDataObject = MathUtilities.Tools.Dgt.Models.DgtObject.createUpdateData();
                updateDataObject.genesis = this;
                updateDataObject.caller = this;
                updateDataObject.relocatedEntities = willUpdate;
                updateDataObject.forceDrawing = this.TRAVEL_TEST;
                updateDataObject.newPosition = newPoint;
                this.triggerRearrangement(updateDataObject);
                updateDataObject.forceDrawing = null;
                updateDataObject.relocatedEntities = [];
                updateDataObject.relocatedEntities.willUpdate = willUpdate;
                this.triggerRearrangement(updateDataObject);

                this.trigger('settled', this);

                return 1;
            }
            return 0; //...... creating a point on previously created point shouldn't be possible
        },

        "incinerate": function() {
            var relation, labelData;
            if (this._incinerated) {
                return;
            }

            //if marked as anchor in engine, remove it
            if (this.engine.anchor === this) {
                this.engine.anchor = null;
            }
            this._incinerated = true;
            //...... implement

            this.trigger('incinerated', this);

            this.engine.plotter.removeEquation(this.equation);

            labelData = this.equation.getLabelData();
            if (labelData && labelData.labelObject) {
                this.setProperty('labelVisibility', false);
                this.engine.grid.removeDrawingObject(labelData.labelObject);
            }

            this.equation.flushData();

            this.equation.setParent(null);
            this.equation.off('plotComplete', this.onPlotComplete);
            delete this.equation;
            delete this.visible;
            while (this._childrenRelationships.length > 0) {
                relation = this._childrenRelationships.pop();
                //incinerate the relationship
                relation.incinerate();
            }

            if (this.creator) {
                this.creator.incinerate();
            }
            delete this.creator;

            this._incinerated = true;
        },

        "triggerRearrangement": function(updateData) {
            if (this._incinerated) {
                return;
            }

            var i, updateLabel, updateValue, curPosition = this.equation.getPoints()[0],
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

            if (!modifyAttributes) {
                updateValue = true;
                updateLabel = false;
            } else {
                updateValue = modifyAttributes.indexOf('value') > -1;
                updateLabel = modifyAttributes.indexOf('label') > -1;
            }

            if (this.properties.binaryInvisibility & this.INVALID || relocatedEntities.indexOf(this) > -1) {
                return;
            }

            relocatedEntities.push(this);

            updateDataObject = DgtObject.createUpdateData();
            updateDataObject.genesis = genesis;
            updateDataObject.newPosition = newPosition;
            updateDataObject.relocatedEntities = relocatedEntities;
            updateDataObject.forceDrawing = forceDrawing;
            updateDataObject.modifyAttributes = modifyAttributes;

            if (!(forceDrawing & this.TRAVEL_TEST)) {

                if (updateLabel) {
                    this.updateLabelText(null, null, false);
                }

                if (updateValue) {

                    if (genesis !== this && newPosition) {
                        dx = newPosition[0] - curPosition[0];
                        dy = newPosition[1] - curPosition[1];

                        this.setCoordinate(newPosition);
                    }
                }
            }

            //...... confirm this case

            updateDataObject.caller = this;
            updateDataObject.newPosition = null;
            updateDataObject.dx = dx;
            updateDataObject.dy = dy;
            if (this.creator) {
                this.creator.moveRelatives(updateDataObject);
            }

            //move children

            if (this._childrenRelationships.length > 0) {

                for (i = 0; i < this._childrenRelationships.length; i++) {
                    //XOR
                    if (Boolean(forceDrawing & this.TRAVEL_WARP) ^ Boolean(this._childrenRelationships[i]._universe) ||
                        Boolean(forceDrawing & this.TRAVEL_WARP) && this._childrenRelationships[i]._universe !== genesis) {
                        continue;

                    }

                    this._childrenRelationships[i].moveRelatives(updateDataObject);
                }
            }
            if (this._menteeRelations.length > 0) {
                for (i = 0; i < this._menteeRelations.length; i++) {
                    this._menteeRelations[i].moveRelatives(updateDataObject);
                }
            }
        },

        "findDerivedPointPosition": function() {
            if (!this.creator) {
                return;
            }
            var position = this.engine.calculatePointPosition(this.creator);

            if (!position) {
                return;
            }
            position = [position[0], position[1]];
            this.setCoordinate(position);
        },

        "getCoordinate": function() {
            var pointsGroup = this.equation.getPointsGroup(),
                canvasPosition, gridPosition;
            if (!pointsGroup) {
                return void 0;
            }
            canvasPosition = [pointsGroup.position.x, pointsGroup.position.y];
            gridPosition = this.engine.grid._getGraphPointCoordinates(canvasPosition);
            return gridPosition;
        },

        //...... : update engine for this new api
        "setCoordinate": function(coordinates) {
            var grid,
                equationPoints = this.equation.getPoints(),
                equationPointsGroup;

            if (!(geomFunctions.isPaperRenderableValue(coordinates[0]) && geomFunctions.isPaperRenderableValue(coordinates[1]))) {
                this.changeObjectVisibility(false, this.INVALID);
                return;
            }
            this.changeObjectVisibility(true, this.INVALID);

            equationPointsGroup = this.equation.getPointsGroup();

            if (equationPoints) {
                this.equation.setPoints([
                    [coordinates[0], coordinates[1]]
                ]);
            }

            if (equationPointsGroup) {
                grid = this.engine.grid;
                coordinates = grid._getCanvasPointCoordinates(coordinates);
                equationPointsGroup.firstChild.position.x = coordinates[0];
                equationPointsGroup.firstChild.position.y = coordinates[1];

                equationPointsGroup.lastChild.position.x = coordinates[0];
                equationPointsGroup.lastChild.position.y = coordinates[1];
            }

            this.equation.trigger('teleported', this.equation);
        },

        "setLocusOfPoint": function() {
            if (this.getCreationMethod() === 'pointOnObject') {
                this.equation.setLocus(this.creator.sources[0].equation);
            }
        },
        "changePointVisibility": function(bVisible) {
            this.visible = bVisible;
            if (this.equation.getPointsGroup()) {
                this.equation.getPointsGroup().visible = bVisible;
            }
        },

        "showHidePoint": function(visible) {
            var equationPointsGroup = this.equation.getPointsGroup(),
                substitutePoint = this.engine._undergoingOperation._substitutePoint;

            if (equationPointsGroup) {
                if (typeof visible !== 'undefined') {
                    equationPointsGroup.visible = visible;
                    if (substitutePoint) {
                        this.equation.setVisible(visible);
                    } else {
                        this.changeObjectVisibility(visible, this.USER);
                    }
                    this.visible = visible;
                } else {
                    equationPointsGroup.visible = !equationPointsGroup.visible;
                    if (substitutePoint) {
                        this.equation.setVisible(equationPointsGroup.visible);
                    } else {
                        this.changeObjectVisibility(equationPointsGroup.visible, this.USER);
                    }
                    this.visible = equationPointsGroup.visible;
                }
            }
        },

        "getData": function() {
            var pointJSON = {
                    "id": null,
                    "label": null,
                    "children": [],
                    "equation": null,
                    "followers": []
                },
                loopVar = 0;
            pointJSON.stateOfMind = this._stateOfMind;
            pointJSON.id = this.id;
            pointJSON.incinerated = this._incinerated;
            pointJSON.equation = this.equation.getData();
            pointJSON.properties = this.properties;
            pointJSON.serialNumber = this.serialNumber;
            pointJSON.originalDragPosition = this.originalDragPosition || this.engine.grid._getCanvasPointCoordinates(this.equation.getPoints()[0]);
            if (this._followers) {
                for (loopVar = 0; loopVar < this._followers.length; loopVar++) {
                    if (this._followers[loopVar]) {
                        pointJSON.followers.push(this._followers[loopVar].id);
                    }
                }
            }
            pointJSON.division = this.division;
            return pointJSON;
        },

        "setData": function(pointJson, engine) {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                loopVar;
            this.setEngine(engine);
            DgtEngine.restoreKind = DgtEngine.ACTION_SAVE_RESTORE;
            this.id = pointJson.id;
            this._incinerated = pointJson.incinerated;
            this.equation.setData(pointJson.equation);
            this.equation.setParent(this);
            this.setStateOfMind(pointJson.stateOfMind);
            this.division = pointJson.division;
            this.equation.getLabelData().isSaveRestoreData = true;
            this.properties = pointJson.properties;
            if (!isNaN(pointJson.serialNumber)) {
                this.serialNumber = pointJson.serialNumber;
                this.equation.depthLevel = pointJson.serialNumber;
            }
            if (pointJson.originalDragPosition) {
                this.originalDragPosition = pointJson.originalDragPosition;
            }
            if (pointJson.followers) {
                for (loopVar = 0; loopVar < pointJson.followers.length; loopVar++) {
                    if (this.engine.getEntityFromId(pointJson.followers[loopVar])) {
                        this._followers.push(this.engine.getEntityFromId(pointJson.followers[loopVar]));
                    }
                }
            }
            this.engine.addPointToPlot(this);
            this.setProperties();
            this.setVisibility(this.properties.binaryInvisibility);

            this.engine.acknowledgeEntity(this);
            DgtEngine.restoreKind = null;
            this.equation.getLabelData().isSaveRestoreData = false;

            if (this.properties.isMarkedAnchor) {
                this.engine.anchor = this;
                this.engine._updateDrawableColor(this);
            }
        },

        "getStateOfMind": function() {
            return this._stateOfMind;
        },

        "_consumeID": function() {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            this.id = DgtEngine.getIdForEntity(this);
            this.assignLabel();
            DgtEngine.entityCount.points++;
        },


        "updateGrowthPhase": function() {
            var path;
            if (this._universe) {
                if (this.growthPhase !== 'dwarf') {
                    this.growthPhase = 'dwarf';
                    this.equation.setThickness(2.0);
                    this.engine.grid.drawPoint(this.equation);
                }

                path = this.equation.getPointsGroup();
                if (path) {
                    path.sendToBack(); // handle case when point is to be redrawn.
                }
            }
        },

        "setPositionOfPointOnObject": function(canvasPosition) {
            var grid = this.engine.grid,
                DgtShape = MathUtilities.Tools.Dgt.Models.DgtShape,
                equation = this.equation,
                locus = this.equation.getLocus(),
                pointsGroup = equation.getPointsGroup(),
                gridPosition = grid._getGraphPointCoordinates(canvasPosition),
                newGridPosition = DgtShape.getClosestPointOnShape(locus.getParent().species, gridPosition, locus.getConstants()),
                newCanvasPosition = grid._getCanvasPointCoordinates(newGridPosition);
            this.originalDragPosition = canvasPosition;
            newCanvasPosition = MathUtilities.Tools.Dgt.Models.DgtDrawable.constraintDrag(newCanvasPosition, locus.getParent().equation, true);

            if (newCanvasPosition.offset) {
                this.creator.possibleOffset = newCanvasPosition.offset;
            }
            newGridPosition = grid._getGraphPointCoordinates(newCanvasPosition);
            grid.setChildrenPosition(pointsGroup, newCanvasPosition);
            equation.setPoints([
                [newGridPosition[0], newGridPosition[1]]
            ]);

            return newCanvasPosition;
        },

        "setStateOfMind": function(state) {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            if (state === 'serene') {
                this._stateOfMind = state;
                this.equation.setDraggable(state === 'serene');
                if (!MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind && !this._isDEBUG) {
                    this._consumeID();
                }

                if (isNaN(this.serialNumber)) {
                    if (this._universe) {
                        this.serialNumber = DgtEngine.allEntitiesCount.serialNumber / DgtEngine.DIVISION_CONST_FOR_DEPTH_LEVEL;
                    } else {
                        this.serialNumber = DgtEngine.allEntitiesCount.serialNumber;
                    }
                    this.equation.depthLevel = this.serialNumber;
                    DgtEngine.allEntitiesCount.serialNumber++;
                }
                this.setSerialNumber();
            }
        }
    }, {
        "pointNameCounter": 97,
        "getNextPointName": function() {
            var DgtPoint = MathUtilities.Tools.Dgt.Models.DgtPoint,
                name = String.fromCharCode(DgtPoint.pointNameCounter),
                asciiCodeA = 65,
                asciiCodeLowerZ = 122;

            DgtPoint.pointNameCounter = DgtPoint.pointNameCounter > asciiCodeLowerZ ? asciiCodeA : DgtPoint.pointNameCounter + 1;
            return name;
        },

        "createPointCoordinate": null,

        "setNextBootstrapCoordinate": function(point) {
            MathUtilities.Tools.Dgt.Models.DgtPoint.createPointCoordinate = point;
        },

        "hackPointPosition": function(point, gridPosition, canvasPosition) {
            var group, groupVisible, groupHit, deltaX, deltaY;
            point.equation.setPoints([
                [gridPosition[0], gridPosition[1]]
            ]);
            if (point.properties.binaryInvisibility !== 0) {
                return;
            }
            group = point.equation.getPointsGroup();
            groupVisible = group.firstChild;
            groupHit = group.lastChild;

            deltaX = canvasPosition[0] - groupVisible.position.x;
            deltaY = canvasPosition[1] - groupVisible.position.y;

            groupVisible.position.x = canvasPosition[0];
            groupVisible.position.y = canvasPosition[1];

            groupHit.position.x = canvasPosition[0];
            groupHit.position.y = canvasPosition[1];

            if (point.equation && point.equation.getLabelData().labelObject) {
                point.engine.grid._handleLabelPostDrag(point.equation, deltaX, deltaY);
            }
        },

        "onRelocate": null,
        "onDrag": null

    });
})(window.MathUtilities);
