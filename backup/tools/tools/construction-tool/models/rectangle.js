    (function(MathUtilities) {
        "use strict";
        var ConstructionTool = MathUtilities.Tools.ConstructionTool;
        /*******************************************************************/
        /*                           Rectangle                             */
        /*******************************************************************/
        /**
         * A customized Backbone.Model that represents rectangle shape.
         * @class MathUtilities.Tools.ConstructionTool.Models.Rectangle
         * @constructor
         * @extends MathUtilities.Tools.ConstructionTool.Models.BaseShape
         */
        ConstructionTool.Models.Rectangle = ConstructionTool.Models.BaseShape.extend({
            "setDefaults": function() {
                ConstructionTool.Models.Rectangle.__super__.setDefaults.apply(this, arguments);
                this.setOptions({
                    "shapeType": ConstructionTool.Views.ToolType.Rectangle,
                    "closed": true
                });
            }
        });
    }(window.MathUtilities));
