/* globals MathUtilities */

(function() {
    'use strict';
    MathUtilities.Components.CanvasAcc.Models.CanvasItem = Backbone.Model.extend({
        "defaults": function() {
            return {
                "tabindex": null,
                "paperItem": null
            };
        },

        "initialize": function(canvasAccID) {
            this.set("canvasAccId", canvasAccID);
        }
    });
})();
