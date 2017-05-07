Tasker.Views.Comment = Backbone.View.extend({
    "initialize": function() {
        this.render();
    },
    "render": function() {
        this.createComment();
    },
    "events": {
        "click .comment-delete": "deleteComment",
        "click .comment-edit": "editComment",
        "blur .comment-data": "updateComment"
    },
    "createComment": function() {
        this.$el.append("<div class='comment-data'>" + this.model.get('comment') + "</div>");
        this.$el.append("<div class='comment-edit'><div class='edit-icon'></div></div>");
        this.$el.append("<div class='comment-delete'><div class='delete-icon'>+</div></div>");
    },
    "deleteComment": function() {
        this.model.destroy();
        this.remove();
    },
    "editComment": function() {
        this.$('.comment-data').prop('contenteditable', true).focus();
    },
    "updateComment": function() {
        this.model.set("comment", this.$('.comment-data').html());
    }
}, {

});
