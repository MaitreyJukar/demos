(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Models.AnimateModel = Backbone.Model.extend({
        "defaults": {
            "fadeInLine": null,
            "fadeOutLine": null,
            "animatePaperScope": null,
            "animatedLines": null,
            "intervalCtr": null,
            "grid": null,
            "currentActiveLayer": null,
            "noOfPoints": {
                "markVector": null,
                "markSegmentRatio": null,
                "markAngle": null
            }
        },
        "initialize": function() {
            this.intervalCtr = 0;
            this.noOfPoints = {
                "markVector": 18,
                "markSegmentRatio": 12,
                "markAngle": 9
            };
            this.animatedLines = [];
        }
    });
})(window.MathUtilities);
