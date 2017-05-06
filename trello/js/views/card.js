Tasker.Views.Card = Backbone.View.extend({
    "initialize": function() {
        this.render();
        this.taskCollectionView = [];
    },
    "events": {
    	"click .add-task": this.addTask
    },
    "render": function() {
    	this.$el.append("<div class='card-header'><div class='card-title'></div><div class='edit-title'></div></div>")
        this.$el.append("<div class='tasks-container'></div>");
    	this.$el.append("<div class='add-task-control'><textarea class='task-content-control'></textarea><div class='add-control'>ADD</div></div>");
    	this.$el.append("<div class='add-task'>Add Task...</div>");
    	this.$(".card-title").html(this.model.get("title"))
        this.createTasks();
    },
    "createTasks": function() {
        _.each(this.model.get("taskCollection"), function(taskModel, index) {
            this.taskCollectionView.push(this.createTask(taskModel, null, index));
        });
    },
    "createTask": function(model, title, order) {
        var cardModel = model,
            cardEl = this.$el.find(".task-container").append("<div id='task" + order + "' class='task'></div>");
        if (!model) {
            cardModel = new Tasker.Models.task({
                "title": title,
                "order": order
            });
            this.model.get("cardCollection").add(cardModel);
        }
        return new Tasker.Views.task({
            "model": cardModel,
            "el": this.$(".task").last()
        });
    },
}, {

});
