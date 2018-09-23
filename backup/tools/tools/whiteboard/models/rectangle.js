(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                           Rectangle                             */
    /*******************************************************************/
    WhiteboardTool.Models.Rectangle = WhiteboardTool.Models.BasePolygon.extend({
        "setDefaults": function() {
            WhiteboardTool.Models.Rectangle.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.Rectangle,
                "shapeDimension": {
                    "height": 80
                },
                "menuType": 3
            });
        }
    });
})(window.MathUtilities);
