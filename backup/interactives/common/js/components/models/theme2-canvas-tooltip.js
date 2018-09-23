(function () {
    'use strict';

    /*
	*
	*   D E S C R I P T I O N
	*	
	* @class CanvasTooltip
	* @namespace MathInteractives.Common.Components.Models
    * @extends MathInteractives.Common.Components.Models.BoundedTooltip
	* @constructor
	*/

    MathInteractives.Common.Components.Models.CanvasTooltip = MathInteractives.Common.Components.Models.BoundedTooltip.extend({
        
        /**
        * Initialises CanvasTooltip
        *
        * @method initialize
        **/
        initialize: function () {
            this._superwrapper('initialize',arguments);
        }
    });
})();