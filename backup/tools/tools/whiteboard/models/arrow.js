(function(MathUtilities) {
    'use strict';
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                              Arrow                              */
    /*******************************************************************/
    WhiteboardTool.Models.Arrow = WhiteboardTool.Models.BasePolygon.extend({
        "defaults": {
            "topWidthProportion": 0.2,
            "middleWidthProportion": 0.5,
            "heightProportion": 2 / 3
        },

        "setDefaults": function() {
            WhiteboardTool.Models.Arrow.__super__.setDefaults.apply(this, arguments);
            // Disallow resize and rotate handle
            // Set type of shape
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.Arrow,
                "menuType": 3
            });
        }
    });
})(window.MathUtilities);
