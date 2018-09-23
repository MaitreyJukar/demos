(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                            Ellipse                              */
    /*******************************************************************/
    WhiteboardTool.Models.Ellipse = WhiteboardTool.Models.BasePolygon.extend({
        "setDefaults": function() {
            WhiteboardTool.Models.Ellipse.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.Ellipse,
                "shapeDimension": {
                    "width": 140
                },
                "menuType": 3
            });
        }
    });
})(window.MathUtilities);
