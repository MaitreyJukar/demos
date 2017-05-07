Tasker.Views.Task = Backbone.View.extend({
    "initialize": function() {
        this.render();
    },
    "render": function() {
        this.createTask();
    },
    "events": {
        "click .edit-task-content": "editTask",
        "mousedown .task-content": "stopDragging",
        "blur .task-content": "stopEditing"
    },
    "createTask": function() {
        this.$el.append("<div class='task-content'>" + this.model.get("content") + "</div>");
        this.$el.append("<div class='edit-task-content'><div class='edit-icon'></div></div>");
    },
    "stopDragging": function(event) {
        if ($(event.currentTarget).prop('contenteditable') === "true") {
            event.stopPropagation();
        }
    },
    "editTask": function(event) {
        event.stopPropagation();
        this.$el.find(".task-content").prop("contenteditable", true).focus();
    },
    "stopEditing": function() {
        var $content = this.$el.find(".task-content");
        $content.prop("contenteditable", false);
        this.model.set('content', $content.html());
    }
}, {

});
