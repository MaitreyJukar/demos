/* globals _, $, window, geomFunctions*/
(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Dgt.Models.DgtAnnotation = MathUtilities.Tools.Dgt.Models.DgtDrawable.extend({
        "antecedents": null,

        "children": null,
        "childrenRelationships": null,
        "points": [],
        "species": null,
        "label": null,
        "properties": null,
        //when drawing is complete
        "complete": null,
        "pencilThickness": 3,
        "penThickness": 5,
        "_incinerate": false,
        "isFinished": false,

        "initialize": function initialize() {
            var options = arguments[0],
                DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine;
            MathUtilities.Tools.Dgt.Models.DgtAnnotation.__super__.initialize.apply(this, arguments);
            this.division = 'annotation';

            if (options && options.universe) {
                this._universe = options.universe;
            }
            if (!DgtEngine.restoreKind) {
                this.id = DgtEngine.getIdForEntity(this);
                DgtEngine.entityCount.annotations++;
            }
            if (isNaN(this.serialNumber)) {
                this.setSerialNumber();
                this.equation.depthLevel = this.serialNumber;
            }
            this.species = 'annotation';
            this.equation.setLatex('');
            this.equation.setSpecie('annotation');
            this.equation.setSmoothPolygon(false);
            this.equation.setClosedPolygon(false);
            this.equation.setDraggable(true);
            this.equation.setParent(this);
            this.equation.setColor('black');
            this.equation.setThickness(this.pencilThickness);

            this.childrenRelationships = [];
            this.equation.setPoints([]);
            this._incinerate = false;
            this.equation.setExtraThickness(true);
            this.division = 'annotation';
            this.isFinished = false;
            this.redoData = this.equation.getData();
            this.onRelocate = _.bind(function(relocateData) {
                this.saveDataOnRelocate(relocateData.clone());
            }, this);
            this.onDragBegin = _.bind(function(previousPosition, equation, event) {
                if (event.sessionTimestamp === this.getLastSelectTimestamp()) {
                    this.engine.deselectAll();
                    this.engine._select(this);
                }
            }, this);


        },
        //update grid coordinates by dx and dy
        "shiftPointsBy": function shiftPointsBy(dx, dy) {
            var points, point, len;
            points = this.equation.getPoints();
            len = points.length;
            for (point = 0; point < len; point++) {
                if (points[point]) {
                    points[point][0] += dx;
                    points[point][1] += dy;
                }
            }
            this.updateVisibleDomain();
        },

        "setEngine": function setEngine(engine) {
            this.engine = engine;
        },

        "setData": function setData(annotationJson, engine) {
            var DgtEngine = MathUtilities.Tools.Dgt.Models.DgtEngine,
                equationData = this.equation;
            this.id = annotationJson.id;
            this.setEngine(engine);
            DgtEngine.restoreKind = DgtEngine.ACTION_UNDO_REDO;
            this.species = annotationJson.species;
            equationData.setPoints(annotationJson.equation.points);
            equationData.setLatex(annotationJson.equation.equation);
            equationData.setColor(annotationJson.equation.color);
            equationData.setThickness(annotationJson.equation.thickness);
            equationData.setVisible(annotationJson.equation.visible);
            this.properties = annotationJson.properties;
            if (!isNaN(annotationJson.serialNumber)) {
                this.serialNumber = annotationJson.serialNumber;
                equationData.depthLevel = annotationJson.serialNumber;
            }
            if (annotationJson.division) {
                this.division = annotationJson.division;
            }
            this.isFinished = true;
            this.updateVisibleDomain();
            DgtEngine.restoreKind = null;
        },
        "getData": function getData() {
            var annotationJson = {
                "species": this.species,
                "equation": this.equation.getData(),
                "id": this.id,
                "properties": this.properties,
                "division": this.division,
                "serialNumber": this.serialNumber
            };
            return annotationJson;
        },
        "createAnnotation": function createAnnotation() {

            //......bind on mousedown.
            this.engine.deselectAll();
            this.engine.createAnnotationStart(this.equation.getColor(), this.equation.getThickness());

        },

        "endAnnotation": function endAnnotation() {
            var engine = this.engine;


            this.equation.setPoints(engine.createAnnotationEnd());

            engine.addPointToPlot(this);
            if (this.equation.getPoints().length > 0) {
                engine.acknowledgeEntity(this);
                this.updateVisibleDomain();
            }
            engine._annotationPaths.equation = this.equation;

        },
        "checkForTickMark": function checkForTickMark(event) {
            var engine = this.engine;

            if (engine._undergoingOperation && engine._undergoingOperation.type === 'annotation') {
                engine.checkHitObject(geomFunctions.getCanvasCoordinates(event));
            }

        },
        "setThickness": function setThickness(directive) {
            if (directive === 'pencilAnnotation') {
                this.equation.setThickness(this.pencilThickness);
            } else {
                this.equation.setThickness(this.penThickness);
            }
        },
        "updateVisibleDomain": function() {
            var visibleDomain, i, positionSeed,
                bufferSpace = 0;

            function flexDomain(x, y) {
                if (!visibleDomain) {
                    visibleDomain = {
                        "xmin": x,
                        "xmax": x,
                        "ymin": y,
                        "ymax": y
                    };
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

            positionSeed = this.equation.getPoints();

            for (i = 0; i < positionSeed.length; i++) {
                if (!positionSeed[i]) {
                    continue;
                }
                flexDomain(positionSeed[i][0], positionSeed[i][1]);
            }
            this.equation.setCurveMinima([visibleDomain.xmin, visibleDomain.ymin]);
            this.equation.setCurveMaxima([visibleDomain.xmax, visibleDomain.ymax]);

        },
        "incinerate": function incinerate() {
            var engine = this.engine;
            if (this._incinerated) {
                return;
            }
            this._incinerated = true;
            this.trigger('incinerated', this);
            engine.plotter.removeEquation(this.equation);
            if (engine._annotationPaths) {
                engine._annotationPaths.remove();
            }
            delete this.equation;
        }
    });
})(window.MathUtilities);
