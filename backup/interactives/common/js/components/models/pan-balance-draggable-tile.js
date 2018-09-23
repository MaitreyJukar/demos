(function() {
    'use strict';
    /**
    * Model for creating pan balance draggable tile.
    * 
    * @class PanBalanceDraggableTile
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Models.PanBalanceDraggableTile = Backbone.Model.extend({


    defaults: {

    id: null,
    type: null,
    path: null,
    text: null,
    width: 0,
    imagePathIds: null,
    height: 0,
    isDraggable: null,
    isDisabled: null,
    dataIsVarNegative: null
        
        }

    });
})();
