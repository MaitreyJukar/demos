(function () {
    'use strict';

    var viewClassNamespace = MathInteractives.Common.Components.Views.EquationManagerPro,
        modelClassNamespace = MathInteractives.Common.Components.Models.EquationManagerPro;

    /**
    * SquaredParenthesesTileView holds the data for the squared parentheses tile view.
    *
    * @class SquaredParenthesesTileView
    * @module EquationManagerPro
    * @constructor
    * @type Object
    * @extends MathInteractives.Common.Components.Views.EquationManagerPro.ParenthesesTileView
    * @namespace MathInteractives.Common.Components.Views.EquationManagerPro
    */
    viewClassNamespace.SquaredParenthesesTileView = viewClassNamespace.ParenthesesTileView.extend({
        initialize: function () {
            this.initializeDefaultProperties();
        }

    }, {

    });

})();
