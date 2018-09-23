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

    MathInteractives.Common.Components.Views.DOMTooltipView = MathInteractives.Common.Player.Views.Base.extend({

        tooltipViews : null,
        /**
        * Initialises DOMTooltip
        *
        * @method initialize
        **/
        initialize: function () {	            
            this.idPrefix = this.model.get('idPrefix');
            this.player = this.model.get('player');
            this.manager = this.model.get('manager');
            this.filePath = this.model.get('filePath');
            this.generateTooltipViews();            
        },

        generateTooltipViews : function generateTooltipViews(){
            var elements = this.getElements();
            if(this._isNullOrUndefined(elements)){
                return;
            }            
            var tooltipNameSapce = MathInteractives.Interactivities.ToolTipTest.Views.BoundedTooltip,
                currentitem , 
                id,
                data,
                tooltipView = {};
            for(var i = 0 ; i < elements.length ; i++){
                currentitem = elements[i];
                id = currentitem.data.elementEl;
                data = this._generateTooltipData(currentitem);
                tooltipView[id] = tooltipNameSapce.generateBoundedTooltip(data);    
            }

            this.tooltipViews = tooltipView;
        },

        _generateTooltipData : function _generateTooltipData(currentItem){
            var data = currentItem.data,
                padding = data.padding,
                template = data.template;
            data._player = this.player;
            data.manager = this.manager;
            data.filePath = this.filePath;
            data.elementEl = this.idPrefix + data.elementEl;
            if(template){
                data.text = template;
                data.containerWidth = $(template).width() +   (padding ? padding : 0) ;
                data.containerHeight = $(template).height() + (padding ? padding : 0 );
            }
            data.containerPadding = this.model.get('containerPadding');
            data.idPrefix = this.idPrefix;
            data.containerEleId = this.model.get('containerEleId');
            return data;
        },
        
        getTooltipView : function getTooltipView(elementId){            
            return this._isNullOrUndefined(elementId) ? null : this.tooltipViews[elementId];
        },
        
        getModel : function getModel(){
            return this.model;  
        },

        getElements : function getElements() {
            return this.model.get('elements');            
        },

        setElements : function setElements(elements){
            this.model.set('elements',elements);
        },

        _isNullOrUndefined : function _isNullOrUndefined(object){
            return object === null || typeof object === 'undefined';
        }
    },{
        generateDOMTooltip : function generateDOMTooltip(options){
            var ModelNameSpace = MathInteractives.Interactivities.ToolTipTest.Models.DOMTooltipModel,
                ViewNameSpace = MathInteractives.Interactivities.ToolTipTest.Views.DOMTooltipView;

            var modelInstance = new ModelNameSpace(options),
                viewInstance = new ViewNameSpace({model:modelInstance});

            return viewInstance;
        }
    });
})(window.MathInteractives);