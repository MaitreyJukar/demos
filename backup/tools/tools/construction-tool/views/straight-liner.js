(function(MathUtilities) {
    "use strict";
    var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                          Straight Liner                         */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents StraightLiner.
     * @class MathUtilities.Tools.ConstructionTool.Views.StraightLiner
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Views.BasePen
     */
    ConstructionTool.Views.StraightLiner = ConstructionTool.Views.BasePen.extend({
        "_ruler": null,

        "initModel": function() {
            this.model = new ConstructionTool.Models.StraightLiner();
        },

        "processTouchStart": function() {
            var style = this._getApplicableStrokeStyle(this.isSelected()),
                ruler = this._ruler,
                pencilHolderChildren = ruler.model.get("_path").children["pencil-helper"].children["pencil-holder"].children,
                childLength = pencilHolderChildren.length,
                pencilPosition = null,
                pointOnLine = null,
                iLooper = 0,
                curChild = null,
                oldState = {};

            for (; iLooper < childLength; iLooper++) {
                curChild = pencilHolderChildren[iLooper];
                if (curChild.data === "pencil-raster") {
                    pencilPosition = curChild.position;
                }
            }
            pointOnLine = ruler._getPointOnLine(pencilPosition);
            this.model._feedPoint(new ConstructionTool.Models.Point(pointOnLine));
            this._intermediatePath = new ConstructionTool.Views.PaperScope.Path({
                "maxDistance": 2,
                "minDistance": 1,
                "strokeJoin": "round",
                "strokeCap": "round"
            });

            this.applyStyleToPathGroup(this._intermediatePath, style);
            this.drawIntermediate(pointOnLine);

            // Undo redo state saves
            oldState.bRemove = true;
            oldState.id = this.getId();
            this._savePreviousState(oldState);
        },

        "processTouchMove": function() {
            var ruler = this._ruler,
                pencilHolderChildren = ruler.model.get("_path").children["pencil-helper"].children["pencil-holder"].children,
                childLength = pencilHolderChildren.length,
                pencilPosition = null,
                pointOnLine = null,
                iLooper = 0,
                curChild = null,
                feedPoint = null;

            for (; iLooper < childLength; iLooper++) {
                curChild = pencilHolderChildren[iLooper];
                if (curChild.data === "pencil-raster") {
                    pencilPosition = curChild.position;
                }
            }
            pointOnLine = ruler._getPointOnLine(pencilPosition);

            feedPoint = new ConstructionTool.Models.Point(pointOnLine);

            this.model._feedPoint(feedPoint);
            this.drawIntermediate(feedPoint);
        },

        "processTouchEnd": function() {
            var ruler = this._ruler,
                pencilHolderChildren = ruler.model.get("_path").children["pencil-helper"].children["pencil-holder"].children,
                childLength = pencilHolderChildren.length,
                pencilPosition = null,
                pointOnLine = null,
                feedPoint = null,
                iLooper = 0,
                curChild = null,
                curState = {};

            for (; iLooper < childLength; iLooper++) {
                curChild = pencilHolderChildren[iLooper];
                if (curChild.data === "pencil-raster") {
                    pencilPosition = curChild.position;
                }
            }

            pointOnLine = ruler._getPointOnLine(pencilPosition);

            feedPoint = new ConstructionTool.Models.Point(pointOnLine);

            this.drawIntermediate(feedPoint, true);

            // Saves undo-redo state
            curState = this.model.getCloneData();
            curState.id = this.getId();
            this._saveCurrentState(curState);
            this.trigger("equation-complete");
        }
    });
}(window.MathUtilities));
