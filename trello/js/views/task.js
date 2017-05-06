/*globals Tasker*/
(function() {
    "use strict";
    Tasker.Models.Task = Backbone.Model.extend({
        "defaults": function() {
            return {
                "title": "",
                "order": 0,
            }
        },
        "initalize": function(options) {
        }
        
    });
})();