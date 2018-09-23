(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                            Background                           */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents Background.
     * @class MathUtilities.Tools.ConstructionTool.Views.Background
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Views.BaseShape
     */
    ConstructionTool.Views.Background = ConstructionTool.Views.BaseShape.extend({
        "initModel": function() {
            this.model = new ConstructionTool.Models.Background();
        },

        "draw": function() {
            var canvasSize = ConstructionTool.Views.CanvasSize,
                canvasHeight = canvasSize.height,
                canvasWidth = canvasSize.width,
                backgroundData = this.model.get("_data").backgroundData,
                curState = {};

            if (this._intermediatePath !== null) {
                this._intermediatePath.remove();
                this._intermediatePath = null;
            }
            this._intermediatePath = new ConstructionTool.Views.PaperScope.Path.Rectangle({
                "size": [canvasWidth, canvasHeight],
                "point": [0, 0],
                "fillColor": backgroundData
            });
            this.updatePathZIndex();
            this.trigger("equation-complete");

            curState = this.model.getCloneData();
            curState.id = this.getId();
            this._saveCurrentState(curState);
        },

        /**
         * Applies the style directly to the path group passed to it.
         * @method applyStyleToPathGroup
         * @params {Object} pathGroup object to which style is to be applied.
         * @params {Object} styleData object that is the style data.
         */
        "applyStyleToPathGroup": function(pathGroup, styleData) {
            ConstructionTool.Views.Background.__super__.applyStyleToPathGroup.apply(this, arguments);
            if (pathGroup !== null && typeof pathGroup !== "undefined") {
                if (styleData.fillColor !== null) {
                    pathGroup.fillColor = styleData.backgroundData;
                }
            }
        }
    });
}(window.MathUtilities));
