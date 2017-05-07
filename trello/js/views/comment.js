Tasker.Views.Comment = Backbone.View.extend({
    "initialize": function() {
        this.render();
    },
    "render": function() {
        this.createComment();
    },
    "events": {

    },
    "createComment": function() {
        this.$el.append("<div class='comment-data'>" + this.model.get('comment') + "</div>");
        this.$el.append("<div class='comment-edit'><div class='edit-icon'></div></div>");
        this.$el.append("<div class='comment-delete'><div class='delete-icon'>+</div></div>");
    }
}, {

});
