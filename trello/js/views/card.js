Tasker.Views.Card = Backbone.View.extend({
    "initialize": function() {
        this.render();
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

    }
}, {

});
