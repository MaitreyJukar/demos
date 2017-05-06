Tasker.Views.Card = Backbone.View.extend({
    "initialize": function() {
        this.render();
        this.taskCollectionView = [];
    },
    "events": {
        "click .add-task": "showNewTaskControl",
        "click .delete-icon": "hideNewTaskControl",
        "mousedown .task-content-control": "stopDragging",
        "click .add-control": "addTask"
    },
    "render": function() {
        this.$el.append("<div class='card-header'><div class='card-title'></div><div class='edit-title'></div></div>")
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
            this.createTask(null, content, this.model.get("taskCollection").models.length);
            this.hideNewTaskControl();
        }
    },
    "createTasks": function() {
        _.each(this.model.get("taskCollection"), function(taskModel, index) {
            this.taskCollectionView.push(this.createTask(taskModel, null, index));
        });
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
    }
}, {

});
