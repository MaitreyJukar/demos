/* globals window */

(function(MathUtilities) {
    'use strict';
    MathUtilities.Components.Graph.Models.plotterModel = Backbone.Model.extend({
        "_equations": null,
        "_equationsMap": null,
        "_annotationPaths": null,
        "incompleteAnnotations": null,
        "_firstPoint": null,
        "pathThickness": null,
        "initialize": function() {
            this._equations = [];
            this._equationsMap = {};
            this.incompleteAnnotations = [];
        }

    }, {
        "BASEPATH": '/static/'
    });
}(window.MathUtilities));
