/*globals Tasker*/
(function() {
    "use strict";
    Tasker.Models.Task = Backbone.Model.extend({
        "defaults": function() {
            return {
                "content": "",
                "order": 0,
                "commentCollection": new Tasker.Collections.Comments()
            }
        },
        "initialize": function(options) {
        }
        
    });
})();