(function(MathUtilities) {
    "use strict";
    var WhiteboardTool = MathUtilities.Tools.WhiteboardTool;
    /*******************************************************************/
    /*                             Image                               */
    /*******************************************************************/
    WhiteboardTool.Models.Image = WhiteboardTool.Models.BasePolygon.extend({
        "defaults": {
            /*This flag is set true when image is loaded for the first time.*/
            "isFirstImageLoad": false
        },
        "initialize": function() {
            var renderData;
            WhiteboardTool.Models.Image.__super__.initialize.apply(this, arguments);
            renderData = this.getData();
            renderData.imageData = null;
        },

        "setDefaults": function() {
            var renderData;
            WhiteboardTool.Models.Image.__super__.setDefaults.apply(this, arguments);
            this.setOptions({
                "nType": WhiteboardTool.Views.ShapeType.Image,
                "menuType": 5,
                "minWidth": 1,
                "minHeight": 1,
                "nFillAlpha": 1
            });

            renderData = this.getData();
            renderData.imageData = null;
        },

        "setOptions": function(options) {
            var renderData;
            WhiteboardTool.Models.Image.__super__.setOptions.apply(this, arguments);

            renderData = this.getData();
            if (options) {
                if (options.imageData) {
                    renderData.imageData = options.imageData;
                }
                if (options.scaleFactor) {
                    renderData.scaleFactor = options.scaleFactor;
                }
                if (typeof options.minWidth !== "undefined") {
                    renderData.minWidth = options.minWidth;
                }
                if (typeof options.minHeight !== "undefined") {
                    renderData.minHeight = options.minHeight;
                }
            }
        }
    });
})(window.MathUtilities);
