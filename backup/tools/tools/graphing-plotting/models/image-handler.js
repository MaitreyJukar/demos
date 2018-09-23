(function(MathUtilities) {
    'use strict';
    MathUtilities.Tools.Graphing.Models.ImageHandler = Backbone.Model.extend({
        "defaults": function() {
            return {
                "borderColor": '#000',
                "resizeHandleColor": '#e6e6e6',
                "resizeHandleRadius": '6px'
            };
        }
    });
}(window.MathUtilities));
