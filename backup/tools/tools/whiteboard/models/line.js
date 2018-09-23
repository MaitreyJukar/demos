(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                               Line                              */
    /*******************************************************************/
    WhiteboardTool.Models.Line = WhiteboardTool.Models.BasePolygon.extend({
        "setDefaults": function() {
            WhiteboardTool.Models.Line.__super__.setDefaults.apply(this, arguments);
            // Disallow resize and rotate handle
            // Set type of shape
            this.setOptions({
                "strFillColor": "no-fill",
                "menuType": 4,
                "nType": WhiteboardTool.Views.ShapeType.LineSegment
            });
        }
    });

})(window.MathUtilities);
