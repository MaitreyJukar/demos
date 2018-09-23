(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                      Right angle Triangle                       */
    /*******************************************************************/
    WhiteboardTool.Models.RightTriangle = WhiteboardTool.Models.BasePolygon.extend({
        "setDefaults": function() {
            WhiteboardTool.Models.RightTriangle.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.RightTriangle,
                "menuType": 3
            });
        }
    });
})(window.MathUtilities);
