/*globals Tasker*/
(function() {
    "use strict";
    Tasker.Models.Comment = Backbone.Model.extend({
        "defaults": function() {
            return {
                "comment": "",
                "author": "",
                "time": null
            };
        },
        "initialize": function(options) {}
    });
})();
