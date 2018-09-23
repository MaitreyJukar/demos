(function (MathInteractives) {
    'use strict';

    /*
	*
	*   D E S C R I P T I O N
	*	
	* @class DOMTooltip
	* @namespace MathInteractives.Interactivities.ToolTipTest.Views
    * @extends MathInteractives.Common.Player.Views.Base
	* @constructor
	*/

    MathInteractives.Common.Components.Models.DOMTooltipModel = Backbone.Model.extend({

        idPrefix : null ,
        
        containerEleId : null ,

        containmentArea : null ,

        elements : null,
        
        player : null,            

        /**
        * Initialises DOMTooltip
        *
        * @method initialize
        **/
        initialize: function (options) {	
            this.options = options;
            this._fillData();
        },

        _fillData : function() {
            var options = this.options;
            this.player = options.player;
            this.idPrefix = options.idPrefix;
            this._setContainment(options);
        },

        _setContainment : function(options){
            if(options.containerEleId){  // If container element id is specified
                this.set('containerEleId', options.containerEleId);
            }
            else { // If nothing is provided then consider the overview tab's containment area .
                options.containerEleId = 'activity-area-0';
                this.set('containerEleId', options.containerEleId);
            }
            if(this._isNullOrUndefiend(this.get('containmentArea'))){
                this.set('containmentArea', this._calculateContainment(options.containerEleId));
            }
        },            

        _calculateContainment : function _calculateContainment(eleId) {
            var containmentArea = {},
                $containerElement = this.player.$('#' + this.idPrefix + eleId);

            containmentArea.height = $containerElement.height();
            containmentArea.width = $containerElement.width();
            containmentArea.left = $containerElement.offset().left;
            containmentArea.top = $containerElement.offset().top;

            return containmentArea;
        },
        
        _setTooltipElements : function _setTooltipElements(elements){
            this.set('elements',elements);
        },

        _isNullOrUndefiend : function _isNullOrUndefined(object){
            return object === null || typeof object === 'undefined';
        }
    });
})(window.MathInteractives);