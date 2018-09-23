(function () {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * BaseExponentTileView holds the data for the base exponent tile view.
    *
    * @class BaseExponentTileView
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManagerPro.TileView
    * @namespace MathInteractives.Common.Components.Views.EquationManagerPro
    */
    viewClassNamespace.BaseExponentTileView = viewClassNamespace.TileView.extend({
        initialize: function () {
            this.initializeDefaultProperties();
        }

    }, {

    });

})();
