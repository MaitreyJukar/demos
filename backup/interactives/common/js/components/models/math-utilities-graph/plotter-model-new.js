(function (MathInteractives) {
    'use strict';
    MathInteractives.Common.Components.Models.MathUtilitiesGraphNew.plotterModel = Backbone.Model.extend({
        _equations: null,
        _equationsMap: null,
        _annotationPaths: null,
        incompleteAnnotations: null,
        _firstPoint:null,
        pathThickness: null,
	initialize:function initialize(){
		this._equations = [];
		this._equationsMap = {};
		this.incompleteAnnotations = [];
	}

    }, { BASEPATH: null });
}(window.MathInteractives));