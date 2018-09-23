/* globals window */

(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Graphing.Models.ImageTransformation = Backbone.Model.extend({
        "_item": null,
        "equation": null,
        "canvasContainer": null,
        "initialize": function initialize() {
            this.equation = new MathUtilities.Components.EquationEngine.Models.EquationData();
            this.equation.setDraggable(false);
            this.equation.setParent(this);
        }
    });
})(window.MathUtilities);
