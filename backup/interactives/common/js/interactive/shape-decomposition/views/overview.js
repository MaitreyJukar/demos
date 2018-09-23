(function () {
    'use strict';

	/*
	*
	*   D E S C R I P T I O N
	*
	* @class Overview
	* @namespace MathInteractives.Common.Interactivities.ShapeDecomposition.Views
    * @extends MathInteractives.Common.Player.Views.Base.extend
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeDecomposition.Views.Overview = MathInteractives.Common.Player.Views.Base.extend( {

        /**
        * Initialises Overview
        *
        * @method initialize
        **/
        initialize: function () {
			this.initializeDefaultProperties();
			this.loadScreen("title-screen");
        }
    });
})();
