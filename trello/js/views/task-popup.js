Tasker.Views.TaskPopup = Backbone.View.extend({
    "initialize": function() {
        this.render();
    },
    "render": function() {
        this.createTaskPopup();
    },
    "events": {
        "click .add-comment": "addComment"
    },
    "createTaskPopup": function() {
        var $popupContainer = $('<div class="popup-container"></div>'),
            $commentSection = $("<div class='comment-section'></div>"),
            $comment;
        $popupContainer.append("<div class='task-popup-content' contenteditable>" + this.model.get("content") + "</div>");
        $commentSection.append("<div class='comment-data' contenteditable></div>");
        $commentSection.append("<div class='add-comment'></div>");
        _.each(this.model.get('commentCollection').models, function(model) {
            $comment = $("<div class='comment'></div>");
            Tasker.Views.Comment
            $commentSection.append($comment);
        });
        $popupContainer.append($commentSection);
    },
    "addComment": function() {
        this.$el.commentSection.append("<div class='comment'></div>")
        this.addCommentView(this.addCommentModel());
    },
    "addCommentModel": function() {
        return new Tasker.Models.Comment({});
    },
    "addCommentView": function(model) {
        return new Tasker.Views.Comment({
            model: model
        });
    }
}, {

});
