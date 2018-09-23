(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                         Parallelogram                           */
    /*******************************************************************/
    WhiteboardTool.Models.Parallelogram = WhiteboardTool.Models.BasePolygon.extend({
        "defaults": {
            "bend": 0.3
        },

        "setDefaults": function() {
            WhiteboardTool.Models.Parallelogram.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.Parallelogram,
                "menuType": 3
            });
        }
    });

})(window.MathUtilities);
