(function () {
    'use strict';

    /*
	*
	*   D E S C R I P T I O N
	*	
	* @class CanvasTooltip
	* @namespace MathInteractives.Common.Components.Views
    * @extends MathInteractives.Common.Components.Views.BoundedTooltip
	* @constructor
	*/

    MathInteractives.Common.Components.Views.CanvasTooltip = MathInteractives.Common.Components.Views.BoundedTooltip.extend({


        $pseudoElement : null,

        /**
        * Initialises CanvasTooltip
        *
        * @method initialize
        **/
        initialize: function () {
            this.createDummyElement();
            this._superwrapper('initialize',arguments);
        },    

        createDummyElement : function _createDummyElement(){
            var model = this.model,
                idPrefix = model.get('idPrefix'),
                elementEl = model.get('elementEl'),                
                $canvasElement = $('#' + idPrefix + model.get('containerEleId')),                
                paperObject = model.get('paperObject');

            this.$pseudoElement = $('<div></div>',{id: elementEl});
            this.setElGeometry(paperObject);
            $canvasElement.append(this.$pseudoElement);
        },
        
        setElGeometry : function setElGeometry(paperObject){
            if(this._isNullOrUndefined(paperObject)){
                return false;
            }
            var clonedObject = paperObject.clone(),
                paperObjectBounds = clonedObject.bounds,
                minWidth = 30,
                minHeight = 20,
                height = paperObjectBounds.height < minHeight ? minHeight : paperObjectBounds.height,
                top = paperObjectBounds.height < minHeight ? paperObject.position.y - minHeight / 2 : paperObjectBounds.top,
                width = paperObjectBounds.width < minWidth ? minWidth : paperObjectBounds.width,
                left = paperObjectBounds.width < minWidth ? paperObject.position.x - minWidth/2 : paperObjectBounds.left;            
            this.$pseudoElement.css({
                width : width,
                height : height,
                left : left,
                top : top,
                position : 'absolute',
                zIndex : -1
            });
            clonedObject.remove();
            return true;
        },

        deleteElement : function deleteELment() {
            this.$pseudoElement.remove();
        },
        
        _isNullOrUndefined : function _isNullOrUndefined(object){
            return object === null || typeof object === 'undefined';
        }


    },{
        generateCanvasTooltip : function generateCanvasTooltip(tooltipProps){
            var tooltipModel, tooltipView;
            if (tooltipProps) {

                tooltipModel = new MathInteractives.Common.Components.Models.CanvasTooltip(tooltipProps);
                tooltipView = new MathInteractives.Common.Components.Views.CanvasTooltip({ model: tooltipModel });
                
            }
            return tooltipView;
        }
    });
})();