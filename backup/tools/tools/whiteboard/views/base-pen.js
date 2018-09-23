(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    //base pen view start **********************************************
    WhiteboardTool.Views.BasePen = WhiteboardTool.Views.BaseShape.extend({

        "initModel": function() {
            this.model = new WhiteboardTool.Models.BasePen();
        },

        "processTouchStart": function(eventObject) {
            var oldState = {},
                style = this._getApplicableStrokeStyle(this.isSelected());

            this.model._feedPoint(new WhiteboardTool.Models.Point(eventObject.point.x, eventObject.point.y));
            this.model._feedPoint(new WhiteboardTool.Models.Point(eventObject.point.x, eventObject.point.y));
            this._intermediatePath = new WhiteboardTool.Views.PaperScope.Path();
            this.applyStyleToPathGroup(this._intermediatePath, style);

            // Undo redo state saves
            oldState.bRemove = true;
            oldState.id = this.getId();
            this.drawIntermediate(eventObject);
            this._savePreviousState(oldState);
            this.updatePathZindex();
        },

        "processTouchMove": function(eventObject) {

            this.model._feedPoint(new WhiteboardTool.Models.Point(eventObject.point.x, eventObject.point.y));

            this.drawIntermediate(eventObject);
            this._intermediatePath.smooth();
            this.setOptions({
                "strFillColor": "no-fill"
            });
        },

        "processTouchEnd": function(eventObject) {
            var curState = {};
            this.setBoundingBoxOnPathBounds();
            this.trigger("equation-complete");

            // Undo redo state saves
            curState = this.model.getCloneData();
            curState = this.getViewOptions(curState);
            curState.backupBoundingBox = MathUtilities.Components.Utils.Models.Utils.getCloneOf(this.model.getBackupBoundingBox());
            curState.id = this.getId();
            this._saveCurrentState(curState);
            this.drawIntermediate(eventObject, true);

            this.model.setBackupBoundingBox(this.model.getBoundingBox());
            this.model.setRotationPoint(this.model.getRotationReferencePoint());
            this.setOptions({
                "imageData": this.model.getBoundingBox()
            });
        },

        "drawIntermediate": function(eventObject, isTouchEnd) {
            var intermediatePath = this._intermediatePath,
                fedPoints = this.model.getFedPoints(),
                data = this.model.getData();

            if (intermediatePath) {
                intermediatePath.maxDistance = 2;
                intermediatePath.minDistance = 1;
                intermediatePath.add(eventObject.point);
                intermediatePath.strokeJoin = "round";
                intermediatePath.strokeCap = "round";
                if (isTouchEnd && fedPoints.length === 2) { // 2 is to check if a single point is plotted
                    intermediatePath.add([fedPoints[0].x, fedPoints[0].y]);
                    intermediatePath.add([fedPoints[0].x + 1, fedPoints[0].y + 1]);
                }
                if (intermediatePath && intermediatePath.hitPath) {
                    intermediatePath.hitPath.removeSegments();
                    intermediatePath.hitPath = null;
                }
                if ("ontouchstart" in window) {
                    intermediatePath.hitPath = intermediatePath.clone();
                    intermediatePath.hitPath.strokeColor = "black";
                    intermediatePath.hitPath.strokeColor.alpha = 0;
                    intermediatePath.hitPath.strokeWidth = 20; // 20 is strokewidth
                }
            }
            this.model.setOptions({
                "bAllowSelectionBound": false
            });
            if (data.bSelected) {
                this.drawBounds();
            }
        },

        "rotate": function(angle) {
            var data = this.model.getData(),
                bounds, center = {};
            this.model.setOptions({
                "nRotation": Number(data.nRotation) + Number(angle)
            });
            //this.trigger("object:rotate");
            this.drawBounds();
            bounds = this.model.getBoundingBox();
            center.x = bounds.x + bounds.width / 2;
            center.y = bounds.y + bounds.height / 2;
            this._intermediatePath.rotate(angle, center);
        },

        "draw": function(eventObject) {
            var intermediatePath = this._intermediatePath,
                data = this.model.getData(),
                fedPoints = this.model.getFedPoints(),
                style = this._getApplicableStrokeStyle(this.isSelected()),
                fedPointsLength = fedPoints.length,
                feedPointsCounter;

            if (typeof eventObject !== "undefined" && eventObject !== true) {
                if (eventObject.type !== "mouseup") {
                    intermediatePath.position.x += eventObject.delta.x;
                    intermediatePath.position.y += eventObject.delta.y;
                } else {
                    this.model._clearFedPoints();
                    fedPointsLength = intermediatePath.segments.length;
                    for (feedPointsCounter = 0; feedPointsCounter < fedPointsLength; feedPointsCounter++) {
                        this.model._feedPoint(new WhiteboardTool.Models.Point(intermediatePath.segments[feedPointsCounter].point.x,
                            intermediatePath.segments[feedPointsCounter].point.y));
                    }
                }
            } else {
                if (intermediatePath) {
                    intermediatePath.remove();
                }
                intermediatePath = this._intermediatePath = new WhiteboardTool.Views.PaperScope.Path();
                intermediatePath.maxDistance = 2;
                intermediatePath.minDistance = 1;
                intermediatePath.strokeJoin = "round";
                intermediatePath.strokeCap = "round";
                if (fedPoints.length > 2) {
                    for (feedPointsCounter = 0; feedPointsCounter < fedPointsLength; feedPointsCounter++) {
                        intermediatePath.add(fedPoints[feedPointsCounter]);
                    }
                    intermediatePath.strokeCap = "round";
                    this.applyStyleToPathGroup(intermediatePath, style);
                    intermediatePath.smooth();
                } else if (fedPoints.length === 2) {
                    this.applyStyleToPathGroup(intermediatePath, style);
                    intermediatePath.add([fedPoints[0].x, fedPoints[0].y]);
                    intermediatePath.add([fedPoints[0].x + 1, fedPoints[0].y + 1]);
                }
            }
            this.model.setRotationPoint(this.model.getRotationReferencePoint());

            if (data.bSelected) {
                this.drawBounds();
            }

            if (intermediatePath && intermediatePath.hitPath) {
                intermediatePath.hitPath.removeSegments();
                intermediatePath.hitPath = null;
            }
            if ("ontouchstart" in window) {
                intermediatePath.hitPath = intermediatePath.clone();
                intermediatePath.hitPath.strokeColor = "black";
                intermediatePath.hitPath.strokeColor.alpha = 0;
                intermediatePath.hitPath.strokeWidth = 20; // 20 is strokewidth
            }
            this.updatePathZindex();
        },

        /**
         * Translates the current instance by specified difference.
         * @method translate
         */
        "translate": function(objPoint, bDraw, eventObject, isPan) {
            var intermediatePath = this._intermediatePath,
                pathSegments = null,
                fedPointsCounter = null,
                fedPointsLength = null;

            if (eventObject && eventObject && eventObject.event.type !== "mouseup") {
                intermediatePath.position.x += eventObject.delta.x;
                intermediatePath.position.y += eventObject.delta.y;
            }
            if (isPan) {
                intermediatePath.position.x += objPoint.x;
                intermediatePath.position.y += objPoint.y;
            }

            this.model._clearFedPoints();
            pathSegments = intermediatePath.segments;
            fedPointsLength = pathSegments.length;
            for (fedPointsCounter = 0; fedPointsCounter < fedPointsLength; fedPointsCounter++) {
                this.model._feedPoint(new WhiteboardTool.Models.Point(pathSegments[fedPointsCounter].point.x, pathSegments[fedPointsCounter].point.y));
            }
            this.model.setRotationPoint(this.model.getRotationReferencePoint());

            this.drawBounds();

        },

        "setBoundingBoxOnPathBounds": function() {
            var box = new WhiteboardTool.Models.Rect(),
                bounds = null,
                intermediatePath = this._intermediatePath;

            if (intermediatePath) {
                bounds = intermediatePath.bounds;
            }
            if (bounds) {
                box.x = bounds.x;
                box.y = bounds.y;
                box.width = bounds.width;
                box.height = bounds.height;
            }
            this.model.setBoundingBox(box);
        }
    });

    //base pen view end **********************************************
})(window.MathUtilities);
