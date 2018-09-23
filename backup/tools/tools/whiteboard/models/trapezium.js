(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                            Trapezium                            */
    /*******************************************************************/
    WhiteboardTool.Models.Trapezium = WhiteboardTool.Models.BasePolygon.extend({
        "defaults": {
            "proportion": 0.5
        },

        "setDefaults": function() {
            WhiteboardTool.Models.Trapezium.__super__.setDefaults.apply(this, arguments);
            // Disallow resize and rotate handle
            // Set type of shape
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.Trapezium,
                "menuType": 3
            });
        }
    });
})(window.MathUtilities);
