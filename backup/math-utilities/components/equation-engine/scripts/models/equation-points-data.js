/* globals window */

(function(MathUtilities) {
    'use strict';

    /**
        Class to create points data object to be used to store points related to plots

        @class MathUtilities.Components.EquationPointsData
    **/
    MathUtilities.Components.EquationEngine.Models.EquationPointsData = Backbone.Model.extend({

        "defaults": function() {
            return {
                "_leftArray": null,

                "_points": null,

                "_rightArray": null,

                "_criticalPoints": null,

                "_hollowPoints": null,

                "_interceptPlotPoints": null,

                "_discontinuousPoints": null,

                "_intersectionPoints": null,

                "_inEqualityPlots": null,

                "_curveMaxima": null,

                "_curveMinima": null,

                "_arr": null
            };
        },

        /**
            Flushes all properties of the object and set them to their default values.

            @public
            @method flush
        **/
        "flush": function() {
            this.set({
                "_leftArray": null,
                "_points": null,
                "_rightArray": null,
                "_inEqualityPlots": null,
                "_arr": null
            });
        }

    }, {});
}(window.MathUtilities));
