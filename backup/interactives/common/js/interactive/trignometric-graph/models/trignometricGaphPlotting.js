(function () {
    var className = null;
    /**
    * Model for GridGraph
    *
    * @class ExploreTrignometricGraphPlotting
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricGraphPlotting
    */
    MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricGraphPlotting = Backbone.Model.extend({
        defaults: function () {
            return {
                manager: null,
                path: null,
                player: null,

                gridGraphEl: null,
                gridGraphOptions: null,
                radiusOfCircle: null,
                radiusSliderData: null,
                radiusMaxValue: null,
                distanceSliderData: null,
                trignometricFunction: null,
                noOfPoints: null,
                currentAngle: null,
                shouldUpdateColors: true,
                yLimits:2.5

            }
        },

        initialize: function () {
        }
    }, {});

    className = MathInteractives.Common.Interactivities.TrignometricGraphing.Models.ExploreTrignometricGraphPlotting;
})();