(function(MathUtilities) {
    'use strict';
    /**
     */
    MathUtilities.Tools.Graphing.Collections = {};

    /**
     * Collection of equationData models
     * @class EquationDataCollection
     * @constructor
     * @extends Backbone.Collection
     */
    MathUtilities.Tools.Graphing.Collections.EquationDataCollection = Backbone.Collection.extend({

        "model": MathUtilities.Components.EquationEngine.Models.EquationData

    });

}(window.MathUtilities));
