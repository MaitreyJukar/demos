Tasker.Views.Card = Backbone.View.extend({
    "initialize": function() {
        this.taskCollectionView = [];
        this.render();
    },
    "events": {
        "click .add-task": "showNewTaskControl",
        "click .delete-icon": "hideNewTaskControl",
        "click .add-control": "addTask",
        "mousedown .task-content-control": "stopDragging",
        "click .delete-card": "deleteCard",
        "click .edit-title": "editTitle",
        "blur .edit-title": "stopEditing"
    },
    "render": function() {
        var $cardHeader = $("<div class='card-header'></div>")
        $cardHeader.append("<div class='card-title'></div>");
        $cardHeader.append("<div class='edit-title'><div class='edit-icon'></div></div>");
        $cardHeader.append("<div class='delete-card'><div class='delete-icon'>+</div></div>");
        this.$el.append($cardHeader);
        this.$el.append("<div class='tasks-container'></div>");
        this.$el.append("<div class='add-task-control'><div class='task-content-control' contenteditable='true'></div><div class='add-control'>ADD</div><div class='delete-icon'>+</div></div>");
        this.$el.append("<div class='add-task'>Add Task...</div>");
        this.$(".card-title").html(this.model.get("title"))
        this.createTasks();
        this.makeTaskSortable();
    },
    "stopDragging": function(event) {
        if ($(event.currentTarget).prop('contenteditable') === "true") {
            event.stopPropagation();
        }
    },
    "showNewTaskControl": function() {
        this.$el.find(".add-task-control").show();
        this.$el.find(".add-task").hide();
    },
    "hideNewTaskControl": function() {
        this.$el.find(".add-task-control .task-content-control").html('');
        this.$el.find(".add-task-control").hide();
        this.$el.find(".add-task").show();
    },
    "addTask": function() {
        var content = this.$el.find(".task-content-control").html();
        if (content) {
            this.taskCollectionView.push(this.createTask(null, content, this.model.get("taskCollection").models.length));
            this.hideNewTaskControl();
        }
    },
    "createTasks": function() {
        _.each(this.model.get("taskCollection").models, function(taskModel, index) {
            this.taskCollectionView.push(this.createTask(taskModel, null, index));
        }, this);
    },
    "createTask": function(model, content, order) {
        var taskModel = model;
        this.$el.find(".tasks-container").append("<div id='task-" + order + "' class='task'></div>");
        if (!model) {
            taskModel = new Tasker.Models.Task({
                "content": content,
                "order": order
            });
            this.model.get("taskCollection").add(taskModel);
        }
        return new Tasker.Views.Task({
            "model": taskModel,
            "el": this.$(".task").last()
        });
    },
    "makeTaskSortable": function() {
        this.$el.find(".tasks-container").sortable({
            "items": ".task",
            "connectWith": ".tasks-container"
        });
    },
    "deleteCard": function() {
        _.each(this.taskCollectionView, function(task) {
            task.delete();
        });
        this.model.destroy();
    },
    "editTitle": function() {
        event.stopPropagation();
        this.$el.find(".card-title").prop("contenteditable", true).focus();
    },
    "stopEditing": function() {
        var $title = this.$el.find(".card-title");
        $title.prop("contenteditable", false);
        this.model.set('title', $title.html());
    }
}, {

});
