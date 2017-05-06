Tasker.Views.Card = Backbone.View.extend({
    "initialize": function() {
        this.render();
    },
    "render": function() {
    	this.$el.append("<div class='title-container'></div>");
    	this.$el.append("<div class='action-control-container'></div>");
    	this.$el.append("<div class='tasks-container'></div>");
    	this.$(".title-container").html(this.model.get("title"))
        this.createTasks();
    },
    "createTasks": function() {

    }
}, {

});
