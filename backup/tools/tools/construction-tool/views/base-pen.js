(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                            Base Pen                             */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents BasePen.
     * @class MathUtilities.Tools.ConstructionTool.Views.BasePen
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Views.BaseShape
     */
    ConstructionTool.Views.BasePen = ConstructionTool.Views.BaseShape.extend({
        "initModel": function() {
            this.model = new ConstructionTool.Models.BasePen();
        },

        "processTouchStart": function(eventObject) {
            var style = this._getApplicableStrokeStyle(this.isSelected()),
                oldState = {};

            this.model._feedPoint(new ConstructionTool.Models.Point(eventObject.point.x, eventObject.point.y));

            this._intermediatePath = new ConstructionTool.Views.PaperScope.Path({
                "maxDistance": 2,
                "minDistance": 1,
                "strokeJoin": "round",
                "strokeCap": "round"
            });

            this.applyStyleToPathGroup(this._intermediatePath, style);
            this.drawIntermediate(eventObject.point);

            // Undo redo state saves
            oldState.bRemove = true;
            oldState.id = this.getId();
            this._savePreviousState(oldState);
        },

        "processTouchMove": function(eventObject) {
            this.model._feedPoint(new ConstructionTool.Models.Point(eventObject.point.x, eventObject.point.y));
            this.drawIntermediate(eventObject.point);
            this._intermediatePath.smooth();
        },

        "processTouchEnd": function(eventObject) {
            var curState = {};

            this.setBoundingBoxOnPathBounds();
            this.drawIntermediate(eventObject.point, true);

            // Saves undo-redo state
            curState = this.model.getCloneData();
            curState.id = this.getId();
            this._saveCurrentState(curState);

            this.model.setRotationPoint(this.model.getRotationReferencePoint());
            this.trigger("equation-complete");
        },

        "drawIntermediate": function(point, isTouchEnd) {
            var intermediatePath = this._intermediatePath,
                fedPoints = this.model.getFedPoints(),
                data = this.model.get("_data"),
                style = null;

            if (intermediatePath) {
                if (isTouchEnd && fedPoints.length === 1) {
                    this._intermediatePath.remove();
                    this._intermediatePath = intermediatePath = new ConstructionTool.Views.PaperScope.Path.Circle({
                        "center": fedPoints[0],
                        "radius": data.strokeWidth / 2
                    });
                    this.model.setOptions({
                        "fillColor": data.strokeColor,
                        "radius": data.strokeWidth,
                        "strokeWidth": 0
                    });
                    style = this._getApplicableStrokeStyle(this.isSelected());
                    this.applyStyleToPathGroup(this._intermediatePath, style);
                } else {
                    intermediatePath.add(point);
                }
            }
            if (data.isSelected) {
                this.drawBounds();
            }
        },

        "draw": function() {
            var intermediatePath = null,
                data = this.model.get("_data"),
                fedPoints = this.model.getFedPoints(),
                style = this._getApplicableStrokeStyle(this.isSelected()),
                fedPointsLength = fedPoints.length,
                feedPointsCounter;


            if (this._intermediatePath) {
                this._intermediatePath.remove();
                this._intermediatePath = null;
            }
            this._intermediatePath = intermediatePath = new ConstructionTool.Views.PaperScope.Path({
                "maxDistance": 2,
                "minDistance": 1,
                "strokeJoin": "round",
                "strokeCap": "round"
            });

            if (fedPointsLength > 1) {
                for (feedPointsCounter = 0; feedPointsCounter < fedPointsLength; feedPointsCounter++) {
                    intermediatePath.add(fedPoints[feedPointsCounter]);
                }
                this.applyStyleToPathGroup(intermediatePath, style);
                intermediatePath.smooth();
            } else if (fedPointsLength === 1) {
                this._intermediatePath = intermediatePath = new ConstructionTool.Views.PaperScope.Path.Circle({
                    "center": fedPoints[0],
                    "radius": data.radius / 2
                });
                this.applyStyleToPathGroup(intermediatePath, style);

            }

            this.model.setRotationPoint(this.model.getRotationReferencePoint());

            if (data.isSelected) {
                this.drawBounds();
            }
            this.updatePathZIndex();
        },

        /**
         * Applies the translation occured by moving the shape so far.
         * @method _applyTranslation
         */
        //overide base-shape functionality
        "_applyTranslation": function(eventObject) {
            if (this.model.get("_data").allowSelection === false) {
                return;
            }
            var diffX = 0,
                diffY = 0,
                delta = eventObject.delta;

            if (eventObject.event.type !== "mouseup") {
                diffX = delta.x;
                diffY = delta.y;
            }
            this.translate({
                "x": diffX,
                "y": diffY
            }, false);
        },

        /**
         * Translates the current instance by specified difference.
         * @method translate
         */
        //overide base-shape functionality
        "translate": function(objPoint) {
            var iLooper = null,
                fedPointsLength = null,
                intermediatePath = this._intermediatePath,
                pathPosition = intermediatePath.position,
                pathSegments = intermediatePath.segments,
                curPoint = null;

            ConstructionTool.Views.BasePen.__super__.translate.apply(this, arguments);

            pathPosition.x += objPoint.x;
            pathPosition.y += objPoint.y;

            this.model._clearFedPoints();

            fedPointsLength = pathSegments.length;
            for (iLooper = 0; iLooper < fedPointsLength; iLooper++) {
                curPoint = pathSegments[iLooper].point;
                this.model._feedPoint(new ConstructionTool.Models.Point(curPoint.x, curPoint.y));
            }
            if (this.model.get("_data").isSelected === true) {
                this.drawBounds();
            }
            this.updatePathZIndex();
            this.updateAccBoundingBox();
        },

        "setBoundingBoxOnPathBounds": function() {
            var box = new ConstructionTool.Models.Rect(),
                bounds = null;
            if (this._intermediatePath) {
                bounds = this._intermediatePath.bounds;

                box.x = bounds.x;
                box.y = bounds.y;
                box.width = bounds.width;
                box.height = bounds.height;
            }
            this.model.setBoundingBox(box);
        }
    });
}(window.MathUtilities));
