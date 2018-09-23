    (function(MathUtilities) {
     "use strict";
     var ConstructionTool = MathUtilities.Tools.ConstructionTool;
        /*******************************************************************/
        /*                             Text                                */
        /*******************************************************************/
        ConstructionTool.Models.Text = ConstructionTool.Models.BaseShape.extend({

            "setDefaults": function() {
                ConstructionTool.Models.Text.__super__.setDefaults.apply(this, arguments);
                this.setOptions({
                    "shapeType": ConstructionTool.Views.ToolType.Text,
                    "allowResize": false,
                    "strText": null
                });
            },

            "setOptions": function(options) {
                ConstructionTool.Models.Text.__super__.setOptions.apply(this, arguments);
                var renderData = this.get("_data");
                if (options) {
                    if (typeof options.strText !== "undefined") {
                        renderData.strText = options.strText;
                    }
                    if (typeof options.topLeft !== "undefined") {
                        if (typeof renderData.topLeft === "undefined") {
                            renderData.topLeft = {};
                        }
                        if (typeof options.topLeft.x !== "undefined") {
                            renderData.topLeft.x = options.topLeft.x;
                        }
                        if (typeof options.topLeft.y !== "undefined") {
                            renderData.topLeft.y = options.topLeft.y;
                        }
                    }
                }
            }
        }, {
            "textToolCounter": 0,
            "textToolView": null
        });
    }(window.MathUtilities));
