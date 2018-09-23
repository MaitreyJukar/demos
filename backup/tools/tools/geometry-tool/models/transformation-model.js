(function(MathUtilities) {
    'use strict';

    MathUtilities.Tools.Dgt.Models.TransformationGridModel = Backbone.Model.extend({
        "_item": null,
        "equation": null,
        "initialize": function initialize() {
            this.equation = new MathUtilities.Components.EquationEngine.Models.EquationData();
            this.equation.setDraggable(false);
            this.equation.setParent(this);
        }
    });
})(window.MathUtilities);
