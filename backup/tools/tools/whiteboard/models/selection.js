(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                            Selection                            */
    /*******************************************************************/
    WhiteboardTool.Models.Selection = WhiteboardTool.Models.BasePolygon.extend({
        "setDefaults": function() {
            WhiteboardTool.Models.Selection.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "strFillColor": null,
                "strStrokeColor": "black",
                "nStrokeWidth": 2
            });
        }
    });
})(window.MathUtilities);
