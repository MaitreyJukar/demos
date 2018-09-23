(function(MathUtilities) {
    "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
    /*******************************************************************/
    /*                            Selection                            */
    /*******************************************************************/
    /**
     * A customized Backbone.Model that represents Selection rectangle.
     * @class MathUtilities.Tools.ConstructionTool.Models.SelectionRect
     * @constructor
     * @extends MathUtilities.Tools.ConstructionTool.Models.BaseShape
     */
    ConstructionTool.Models.SelectionRect = ConstructionTool.Models.BaseShape.extend({
        
        "setDefaults": function() {
            ConstructionTool.Models.SelectionRect.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "fillColor": "#fff",
                "strokeColor": "#a6a6a6",
                "strokeWidth": 2,
                "fillAlpha": 0,
                "closed": true
            });
        }
    });
}(window.MathUtilities));
