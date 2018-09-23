(function () {
    'use strict';

    MathUtilities.Components.ToolHolder.Views.ToolContainer = Backbone.View.extend({
        el: '#math-tool-container-' + MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID,

        initliaze: function () {
        },

        getHTML: function () {
            return MathUtilities.Components.ToolHolder.Templates.toolContainer({'tool-id':MathUtilities.Components.ToolHolder.Views.ToolHolder.TOOLID}).trim();
            
        }

    });

})();