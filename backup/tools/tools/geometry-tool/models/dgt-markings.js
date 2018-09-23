/* globals $, window, geomFunctions  */
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtMarking = MathUtilities.Tools.Dgt.Models.DgtObject.extend({

        "id": null,
        "species": null,
        "type": null,
        "engine": null,
        "params": null,
        "markView": null,
        "division": null,
        "_menteeRelations": null, //will be added when relation uses marking to create offspring
        "_childrenRelationships": null,
        "_incinerated": null,

        "initialize": function() {

            MathUtilities.Tools.Dgt.Models.DgtMarking.__super__.initialize.apply(this, arguments);
            this.division = 'marking';
            this._menteeRelations = [];
            this._childrenRelationships = [];
            this._consumeID();
            this.params = {};
            this._incinerated = false;
        },

        "setEngine": function(engine) {
            this.engine = engine;
        },

        "initialiseMarking": function(engine, species) {
            var markings = engine.markings,
                curMarking,
                looper;
            this.setEngine(engine);
            this.setSpecies(species);
            if (species === 'markVector' && !this.creator._universe) {
                this.markView = new MathUtilities.Tools.Dgt.Views.DgtMarking({
                    "model": this
                });
                for (looper in markings) {
                    curMarking = markings[looper];
                    if (curMarking.species === 'vector' && curMarking.markView) {
                        curMarking.markView.removeMarkedPaths();
                    }
                }
            }
            /*set params*/
            this.updateParams(true);
            if (!(MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind || this.creator._universe)) {
                this.engine.updateActiveMarkings(this); /*current markings will be acknowledge when used by relation*/
            }

        },

        "getData": function() {
            var markingJSON = {
                    "id": null,
                    "params": null,
                    "division": null,
                    "_incinerated": null,
                    "restoreInActiveMarking": false,
                    "_menteeRelations": [],
                    "properties": {}
                },
                activeMarkings = {};

            markingJSON.id = this.id;
            markingJSON.species = this.species;
            markingJSON.params = this.params;
            markingJSON.division = this.division;
            markingJSON._incinerated = this._incinerated;
            markingJSON.type = this.type;
            markingJSON.serialNumber = this.serialNumber;
            if (this.properties !== void 0 && this.properties !== null) {
                markingJSON.properties = this.properties;
            }
            if (this._menteeRelations > 0) {
                markingJSON.needToAcknowledge = true;
            }
            activeMarkings = this.engine.getActiveMarking(this.species);
            if ($.inArray(this, activeMarkings) > -1 || activeMarkings === this) {
                markingJSON.restoreInActiveMarking = true;
            }

            return markingJSON;
        },

        "setData": function(markingJSON, engine) {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            this.setEngine(engine);
            DgtEngine.restoreKind = DgtEngine.ACTION_SAVE_RESTORE;
            this.id = markingJSON.id;
            this.species = markingJSON.species;
            this.division = markingJSON.division;
            this._incinerated = markingJSON._incinerated;
            this.type = markingJSON.type;
            if (!isNaN(markingJSON.serialNumber)) {
                this.serialNumber = markingJSON.serialNumber;
            }
            if (markingJSON.properties !== void 0 && markingJSON.properties !== null) {
                this.properties = markingJSON.properties;
            }
            if (markingJSON.restoreInActiveMarking) {
                this.engine.updateActiveMarkings(this);
            }
            DgtEngine.restoreKind = null;
            this.engine.acknowledgeEntity(this);
        },

        "_consumeID": function() {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            this.id = DgtEngine.getIdForEntity(this);
            DgtEngine.entityCount.markings++;
            this.setSerialNumber();
        },

        "setSpecies": function(directive) {
            switch (directive) {
                case 'markAngle':
                    this.species = 'angle';
                    break;
                case 'markRatio':
                    this.species = 'ratio';
                    break;
                case 'markVector':
                    this.species = 'vector';
                    break;
                case 'markDistance':
                    this.species = 'distance';
                    break;
            }
            this.type = this.species;
        },

        "updateParams": function(intialise) {

            var value, isMeasurementMarking = false,
                orderOfPoints,
                sources = this.creator.sources,
                species = this.species,
                curConstants, segOneLength, segTwoLength,
                pointCoordinates = [],
                equationPoints, pointsForAngle,
                cnt = 0,
                constants;

            if (sources.length === 1 && sources[0].division === 'measurement') {
                value = sources[0].value;
                isMeasurementMarking = true;
            } else if (sources.length === 1 && sources[0].division === 'notation') {
                constants = sources[0].equation.getConstants();
                value = geomFunctions.getArcAngle(constants);
                this.params[species] = value;
            } else {
                /*calculate param values depending on species & asign to this.params*/
                while (sources[cnt]) {
                    equationPoints = sources[cnt].equation.getPoints();
                    pointCoordinates.push([equationPoints[0][0], equationPoints[0][1]]);
                    cnt++;
                }
                switch (species) {
                    case 'angle':
                        if (sources[0].division === 'point') {
                            value = geomFunctions.angleBetweenPoints(pointCoordinates[0][0], pointCoordinates[0][1], pointCoordinates[1][0], pointCoordinates[1][1], pointCoordinates[2][0], pointCoordinates[2][1], true);
                        } else {
                            orderOfPoints = this.creator._params.orderOfPointsToFindAngle;
                            geomFunctions.traceConsole(orderOfPoints);
                            pointsForAngle = MathUtilities.Tools.Dgt.Models.DgtEngine.getSegmentPointsToFindAngle(sources[0].equation.getConstants(), sources[1].equation.getConstants(), orderOfPoints);
                            value = geomFunctions.smallerAngleBetweenPoints(pointsForAngle[0].x, pointsForAngle[0].y, pointsForAngle[1].x, pointsForAngle[1].y, pointsForAngle[2].x, pointsForAngle[2].y, true);
                        }
                        this.params[species] = value;
                        break;

                    case 'ratio':
                        curConstants = sources[0].equation.getConstants();
                        segOneLength = geomFunctions.distance2(curConstants.x1, curConstants.y1, curConstants.x2, curConstants.y2);
                        curConstants = sources[1].equation.getConstants();
                        segTwoLength = geomFunctions.distance2(curConstants.x1, curConstants.y1, curConstants.x2, curConstants.y2);

                        value = segOneLength / segTwoLength;
                        this.params[species] = value;
                        break;

                    case 'vector':
                        this.params = {
                            "dx": pointCoordinates[1][0] - pointCoordinates[0][0],
                            "dy": pointCoordinates[1][1] - pointCoordinates[0][1]
                        };

                        break;
                }
                if (this.markView && !this._incinerated &&
                    this.engine.debugMarkVector &&
                    (intialise || this.engine.activeMarkings.vector.indexOf(this) !== -1)) {
                    this.markView.update();
                }
            }

            if (isMeasurementMarking && ['angle', 'ratio', 'distance'].indexOf(species) > -1) {
                this.params[species] = value;
            }
        },

        "shiftMarkingBy": function(dx, dy) {
            if (this.markView && !this._incinerated && this.engine.debugMarkVector) {
                this.markView.shiftMarkingBy(dx, dy);
            }
        },

        "setMenteeRelation": function(relation) {
            if (this.properties !== void 0 && this.properties !== null && this.properties.binaryInvisibility !== 0) {
                this.changeObjectVisibility(true, this.HIDEUNUSEDMARKING);
            }
            if (!MathUtilities.Tools.Dgt.Models.DgtEngine.restoreKind &&
                this._menteeRelations.indexOf(relation) === -1) {
                this._menteeRelations.push(relation);
            }
        },

        "forgetMenteeRelation": function(relation) {
            var index = this._menteeRelations.indexOf(relation);
            if (index > -1) {
                this._menteeRelations.splice(index, 1);
            }
        },

        "update": function(updateData) {
            var loopVar, updateDataObject,
                genesis = updateData.genesis,
                caller = updateData.caller,
                dx = updateData.dx,
                dy = updateData.dy,
                relocatedEntities = updateData.relocatedEntities,
                forceDrawing = updateData.forceDrawing,
                modifyAttributes = updateData.modifyAttributes,
                DgtObject = MathUtilities.Tools.Dgt.Models.DgtObject;

            if (this._incinerated) {
                return;
            }
            if (relocatedEntities) {
                if (relocatedEntities.indexOf(this) > -1) {
                    return;
                }
                relocatedEntities.push(this);
            }

            updateDataObject = DgtObject.createUpdateData();
            updateDataObject.genesis = genesis;
            updateDataObject.caller = caller;
            updateDataObject.dx = dx;
            updateDataObject.dy = dy;
            updateDataObject.relocatedEntities = relocatedEntities;
            updateDataObject.forceDrawing = forceDrawing;
            updateDataObject.modifyAttributes = modifyAttributes;

            if (!(forceDrawing & this.TRAVEL_TEST)) {
                this.updateParams();
            }

            updateDataObject.caller = this;
            updateDataObject.dx = NaN;
            updateDataObject.dy = NaN;
            for (loopVar = 0; loopVar < this._menteeRelations.length; loopVar++) {
                this._menteeRelations[loopVar].moveRelatives(updateDataObject);
            }
        },


        "incinerate": function() {
            var relation;

            if (this._incinerated) {
                return;
            }
            if (this.species === 'vector' && this.markView) {
                this.markView.removeMarkedPaths();
            }
            while (this._menteeRelations.length > 0) {
                relation = this._menteeRelations.pop();
                relation.incinerate();
            }

            this.trigger('incinerated', this);
            this._incinerated = true;
            this.engine.updateActiveMarkings(this);
        },

        "toString": function() {
            return 'marking:' + this.id + ' Source:' + this.creator.sources + '\n';
        }


    }, { //STATIC
        "limitForActiveMarkings": {
            "angle": 1,
            "ratio": 1,
            "vector": 1,
            "distance": 2
        }
    });
})(window.MathUtilities);
