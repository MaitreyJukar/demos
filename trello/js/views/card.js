Tasker.Views.Card = Backbone.View.extend({
    "initialize": function() {
        this.render();
        this.taskCollectionView = [];
    },
    "render": function() {
        this.$el.append("<div class='title-container'></div>");
        this.$el.append("<div class='action-control-container'></div>");
        this.$el.append("<div class='tasks-container'></div>");
        this.$(".title-container").html(this.model.get("title"))
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
