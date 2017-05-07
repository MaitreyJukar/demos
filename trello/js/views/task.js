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
        "click": "openTaskView",
        "blur .task-content": "stopEditing",
        "click .delete-task": "deleteTask",
    },
    "createTask": function() {
        this.$el.append("<div class='task-content'>" + this.model.get("content") + "</div>");
        this.$el.append("<div class='edit-task-content'><div class='edit-icon'></div></div>");

        this.$el.append("<div class='delete-task'><div class='delete-icon'>+</div></div>");

    },
    "stopDragging": function(event) {
        if ($(event.currentTarget).prop('contenteditable') === "true") {
            event.stopPropagation();
        }
    },
    "openTaskView": function(event) {
        if (this.$('.task-content').prop('contenteditable') !== "true") {
            event.stopPropagation();
            this.createTaskPopup();
        }
    },
    "createTaskPopup": function() {
        $('.tasker').append('<div class="task-popup"></div>');
        var popup = new Tasker.Views.TaskPopup({
            model: this.model,
            el: $('.tasker .task-popup')
        });
    },
    "editTask": function(event) {
        event.stopPropagation();
        this.$el.find(".task-content").prop("contenteditable", true).focus();
    },
    "stopEditing": function() {
        var $content = this.$el.find(".task-content");
        $content.prop("contenteditable", false);
        this.model.set('content', $content.html());
    },
    "deleteTask": function(event) {
        event && event.stopPropagation();
        this.model.destroy();
    }
}, {

});
