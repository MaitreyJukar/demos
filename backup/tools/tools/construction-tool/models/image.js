    (function(MathUtilities) {
     "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
        /*******************************************************************/
        /*                             Image                               */
        /*******************************************************************/
        ConstructionTool.Models.Image = ConstructionTool.Models.BaseShape.extend({

            "setDefaults": function() {
                ConstructionTool.Models.Image.__super__.setDefaults.apply(this, arguments);
                this.setOptions({
                    "shapeType": ConstructionTool.Views.ToolType.Image,
                    "imageData": null,
                    "closed": true,
                    "isLoaded": false,
                    "scaleFactor": {
                        "x": 1,
                        "y": 1
                    },
                    "minWidth": 1,
                    "minHeight": 1
                });
            },

            "setOptions": function(options) {
                ConstructionTool.Models.Image.__super__.setOptions.apply(this, arguments);

                var renderData = this.get("_data");
                if (options) {
                    if (typeof options.imageData !== "undefined") {
                        renderData.imageData = options.imageData;
                    }
                    if (typeof options.scaleFactor !== "undefined") {
                        renderData.scaleFactor = options.scaleFactor;
                    }
                    if (typeof options.isLoaded !== "undefined") {
                        renderData.isLoaded = options.isLoaded;
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
    }(window.MathUtilities));
