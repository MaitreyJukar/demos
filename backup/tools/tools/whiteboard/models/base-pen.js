(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                            Base Pen                             */
    /*******************************************************************/
    WhiteboardTool.Models.BasePen = WhiteboardTool.Models.BaseShape.extend({
        "setDefaults": function() {
            WhiteboardTool.Models.BasePen.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "strFillColor": "no-fill",
                "nType": WhiteboardTool.Views.ShapeType.Pencil,
                "menuType": 2
            });
        }
    });

})(window.MathUtilities);
