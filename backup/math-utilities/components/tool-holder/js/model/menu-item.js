(function () {
    'use strict';

    MathUtilities.Components.ToolHolder.Models.MenuItem = Backbone.Model.extend({
        isVisible : false,
        
        isDisabled : false,
        
        isPressed : false,
        
        targetElement : null,
    
    });

})(); 