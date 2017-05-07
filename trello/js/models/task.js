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
            this.populateComments(options.comments);
        },
        "populateComments": function(comments) {
            var commentCollection = this.get("commentCollection");
            _.each(comments, function(comment) {
                commentCollection.add(new Tasker.Models.Comment(comment));
            });
        }

    });
})();
