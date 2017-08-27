(function(MyTrello) {
    MyTrello.Views.CardDetails = Backbone.View.extend({
        "initialize": function(options) {

        },

        "events": {
            "blur .card-name": "updateCardName",
            "click .card-details-close": "resetView",
            "click .add-comment-save": "addComment",
            "click .comment-delete-btn": "deleteComment"
        },

        "render": function() {
            this.$('.card-name').val(this.model.get('name'));
            this.fillComments();
        },

        "fillComments": function() {
            var comments = this.model.get("commentCollection"),
                i = 0;
            for (; i < comments.length; i++) {
                this.appendComment(comments.at(i).get("content"));
            }
        },

        "appendComment": function(content) {
            var $comment = $(".templates .comment").clone();
            $comment.find(".comment-description").html(content);
            this.$(".comment-holder").append($comment);
        },

        "addComment": function() {
            var commentContent = this.$(".add-comment").val();
            if (commentContent) {
                this.model.get("commentCollection").add(new MyTrello.Models.Comment({
                    "content": commentContent
                }));
                this.appendComment(commentContent);
                this.$(".add-comment").val("");
                this.model.save();
            }
        },

        "deleteComment": function(event) {
            var $comment = $(event.target).closest(".comment"),
                index = $comment.index();
            this.model.removeCommentAt(index);
            $comment.remove();
        },

        "updateCardName": function() {
            this.model.set("name", this.$(".card-name").val());
        },

        "show": function() {
            this.$el.addClass('show');
        },

        "hide": function() {
            this.$el.removeClass('show');
        },

        "resetView": function() {
            this.hide();
            this.$(".comment-holder").html("");
            this.$(".card-name").val("");
        }
    }, {});
})(window.MyTrello);