(function(MathUtilities) {
     "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                           Rectangle                             */
    /*******************************************************************/
    /**
     * A customized Backbone.View that represents rectangle.
     * @class MathUtilities.Tools.ConstructionTool.Views.Rectangle
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Views.BaseShape
     */
    ConstructionTool.Views.Rectangle = ConstructionTool.Views.BaseShape.extend({
        "initModel": function initialize() {
            this.model = new ConstructionTool.Models.Rectangle();
        }
    });
}(window.MathUtilities));
