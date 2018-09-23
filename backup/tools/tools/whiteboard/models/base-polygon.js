(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                         Base Polygon                            */
    /*******************************************************************/
    WhiteboardTool.Models.BasePolygon = WhiteboardTool.Models.BaseShape.extend({
        "setDefaults": function() {
            WhiteboardTool.Models.BasePolygon.__super__.setDefaults.apply(this, arguments);
            var data = this.get("_data");
            data.type = "polygon";
            data.closed = true;

        },

        "setOptions": function(options) {
            WhiteboardTool.Models.BasePolygon.__super__.setOptions.apply(this, arguments);

            var data = this.get("_data");

            if (options.type) {
                data.type = options.type;
            }
            if (typeof options.closed !== "undefined" && options.closed !== null) {
                data.closed = options.closed;
            }
        }
    });
})(window.MathUtilities);
