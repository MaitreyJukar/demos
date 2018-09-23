(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.ConstructionTool.Models.CanvasAcc = Backbone.Model.extend({
        "defaults": function() {
            return {
                "startIndex": 0,
                "paperScope": null,
                "isAccessible": false,
                "accManager": null,
                "elements": [],
                "elemMapping": {}
            };
        }

    });

})(window.MathUtilities);
