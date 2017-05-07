/*globals Tasker*/
(function() {
    "use strict";
    Tasker.Collections.Comments = Tasker.Collections.Base.extend({
        "saveData": function() {
            var comments = [];
            _.each(this.models, function(commentModel) {
                var comment = {};
                comment.comment = commentModel.get("comment");
                comment.author = commentModel.get("author");
                comment.time = commentModel.get("time");
                comments.push(comment);
            });
            return comments;
        }
    });
})();
