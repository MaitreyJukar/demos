(function (MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
   //rectangle view start **********************************************
    WhiteboardTool.Views.Rectangle = WhiteboardTool.Views.BasePolygon.extend({
        "initModel": function() {
            this.model = new WhiteboardTool.Models.Rectangle();
        },

        "processTouchEnd": function() {
            WhiteboardTool.Views.Rectangle.__super__.processTouchEnd.apply(this, arguments);
            this.trigger("equation-complete");
        }
    });

    //rectangle view end **********************************************
})(window.MathUtilities);
