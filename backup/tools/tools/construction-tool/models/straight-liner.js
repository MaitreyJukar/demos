(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                          Straight Liner                         */
    /*******************************************************************/
    /**
     * A customized Backbone.Model that represents Straight liner shape.
     * @class MathUtilities.Tools.ConstructionTool.Models.StraightLiner
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Models.BasePen
     */
    ConstructionTool.Models.StraightLiner = ConstructionTool.Models.BasePen.extend({
        "setDefaults": function() {
            ConstructionTool.Models.StraightLiner.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "fillColor": "no-fill",
                "shapeType": ConstructionTool.Views.ToolType.StraightLiner,
                "allowSelection": false
            });
        }
    });
}(window.MathUtilities));
