(function(MathUtilities) {
     "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                            Base Pen                             */
    /*******************************************************************/
    /**
     * A customized Backbone.Model that represents Base pen.
     * @class MathUtilities.Tools.ConstructionTool.Models.BasePen
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Models.BaseShape
     */
    ConstructionTool.Models.BasePen = ConstructionTool.Models.BaseShape.extend({
        "setDefaults": function() {
            ConstructionTool.Models.BasePen.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "fillColor": "no-fill",
                "shapeType": ConstructionTool.Views.ToolType.Pencil,
                "allowSelection": false
            });
        }
    });
}(window.MathUtilities));
