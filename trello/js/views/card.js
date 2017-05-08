Tasker.Views.Card = Backbone.View.extend({
    "initialize": function() {
        this.taskCollectionView = [];
        this.render();
        this.listenTo(this.model.get("taskCollection"), "remove", this.deleteTask);
        this.listenTo(this.model.get("taskCollection"), "add", this.updateTaskCount);
        this.listenTo(this.model, "change:activeTaskData", this.addTaskOnSort);
    },
    "events": {
        "click .add-task": "showNewTaskControl",
        "click .delete-icon": "hideNewTaskControl",
        "click .add-control": "addTask",
        "mousedown .task-content-control": "stopDragging",
        "click .delete-card": "deleteCard",
        "click .edit-title": "editTitle",
        "blur .card-title": "stopEditing",
        "mousedown .card-title": "stopDragging"
    },
    "render": function() {
        var $cardHeader = $("<div class='card-header'></div>");
        $cardHeader.append("<div class='task-count'></div>");
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
        this.updateTaskCount();
    },
    "updateTaskCount": function() {
        this.$(".task-count").html("Number of tasks: " + this.model.get("taskCollection").length)
    },
    "stopDragging": function(event) {
        if ($(event.currentTarget).prop('contenteditable') === "true") {
            event.stopPropagation();
        }
    },
    "showNewTaskControl": function() {
        this.$el.find(".add-task-control").show().focus();
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
        var startIndex = -1,
            stopIndex = -1,
            numberOfItems,
            self = this;
        this.$el.find(".tasks-container").sortable({
            "items": ".task",
            "connectWith": ".tasks-container",
            "activate": function(event, ui) {
                startIndex = -1;
                stopIndex = -1;
                var setActiveSortData = {},
                    currentTask;
                numberOfItems = self.$el.find(".task:not(.ui-sortable-placeholder)").length;
                if (ui.sender[0] === self.$el.find('.tasks-container')[0]) {
                    startIndex = $(ui.item).index();
                    currentTask = self.model.get("taskCollection").at(startIndex);
                    setActiveSortData.content = currentTask.get("content");
                    setActiveSortData.order = currentTask.get("order");
                    setActiveSortData.comments = currentTask.get("commentCollection").saveData();

                    self.model.trigger('setActiveSortData', setActiveSortData);
                }
            },
            "deactivate": function(event, ui) {
                if (numberOfItems !== self.$el.find(".task:not(.ui-sortable-placeholder)").length) {
                    if (startIndex > -1) {
                        self.taskCollectionView[startIndex].deleteTask();
                    } else {
                        self.stopIndex = $(ui.item).index();
                        self.itemToRemove = $(ui.item);
                        self.model.trigger("getActiveCardData", self.model);
                    }
                } else if (ui.sender[0] === self.$el.find('.tasks-container')[0]) {
                    stopIndex = $(ui.item).index();
                    if (startIndex !== stopIndex) {
                        self.model.get("taskCollection").updateModelsOnSort(startIndex, stopIndex);
                        self.updateViewsOnSort(startIndex, stopIndex);
                    }
                }
            }
        });
    },
    "addTaskOnSort": function() {
        var taskModel = new Tasker.Models.Task(this.model.get("activeTaskData"));
        this.itemToRemove.remove();
        this.taskCollectionView.push(this.createTask(taskModel, null, this.model.get("taskCollection").length));
        this.model.get("taskCollection").add(taskModel);
        this.model.get("taskCollection").updateModelsOnSort(this.model.get("taskCollection").length - 1, this.stopIndex);
        this.updateViewsOnSort(this.model.get("taskCollection").length - 1, this.stopIndex);
        this.updateTaskOrder(this.model.get("taskCollection").length - 1, this.stopIndex);
    },
    "updateViewsOnSort": function(indexA, indexB) {
        this.taskCollectionView.splice(indexB, 0, this.taskCollectionView.splice(indexA, 1)[0]);
    },
    "updateTaskOrder": function(indexA, indexB) {
        if (indexB === 0) {
            $(this.$('.task').eq(indexA)).insertBefore($(this.$('.task').eq(0)));
            return;
        }
        $(this.$('.task').eq(indexA)).insertAfter($(this.$('.task').eq(indexB - 1)));
    },
    "deleteCard": function() {

        while (this.taskCollectionView.length) {
            this.taskCollectionView[this.taskCollectionView.length - 1].deleteTask();
        }
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
    },
    "deleteTask": function(model) {
        var taskIndex = model.get("order");
        this.taskCollectionView[taskIndex].remove();
        this.taskCollectionView.splice(taskIndex, 1);
        this.updateTaskCount();

    }
}, {

});
