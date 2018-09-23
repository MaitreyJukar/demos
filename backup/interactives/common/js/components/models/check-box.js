(function () {
    'use strict';
    MathInteractives.Common.Components.Models.CheckBox = Backbone.Model.extend({
        defaults: {
            player:null,
            manager:null,
            filePath:null,
            checkedByDefault:null,
            enabledByDefault:null,
            containerId: null,
            checkUncheck: false
        },

        _initialize: function () {
            
        }

    });
})();

