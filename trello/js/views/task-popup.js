Tasker.Views.TaskPopup = Backbone.View.extend({
    "initialize": function() {
        this.render();
    },
    "render": function() {
        this.createTaskPopup();
    },
    "events": {
        "click .add-comment": "addNewComment",
        "click .close-button": "closePopup"
    },
    "createTaskPopup": function() {
        var $popupModal = $('<div class="popup-modal"></div>'),
            $popupContainer = $('<div class="popup-container"><div class="close-button"><div class="delete-icon">+</div></div></div>'),
            $commentSection = $("<div class='comment-section'></div>");
        $popupContainer.append("<div class='task-popup-content' contenteditable>" + this.model.get("content") + "</div>");
        $commentSection.append("<div class='comment-data-control' contenteditable></div>");
        $commentSection.append("<div class='add-comment'>ADD COMMENT</div>");
        $commentSection.append("<div class='comments'></div>");
        $popupContainer.append($commentSection);
        $popupModal.append($popupContainer);
        this.$el.append($popupModal);
        _.each(this.model.get('commentCollection').models, function(model) {
            this.addComment(model);
        }, this);
    },
    "addNewComment": function() {
        var comment = this.$('.comment-data-control').html();
        if (comment) {
            this.addComment(this.addCommentModel({
                "comment": comment
            }));
            this.$('.comment-data-control').html("");
        }
    },
    "addComment": function(model) {
        var $comment = $("<div class='comment'></div>")
        this.$el.find(".comments").append($comment);
        this.addCommentView($comment, model);
    },
    "addCommentModel": function(params) {
        return new Tasker.Models.Comment(params);
    },
    "addCommentView": function(comment, commentModel) {
        return new Tasker.Views.Comment({
            "model": commentModel,
            "el": comment
        });
    },
    "closePopup": function() {
        this.remove();
    }
}, {

});
