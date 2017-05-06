Tasker.Views.Card = Backbone.View.extend({
    "initialize": function() {
        this.render();
    },
    "render": function() {
    	this.$el.append("<div class='card-header'><div class='card-title'></div><div class='edit-title'></div></div>")
    	this.$el.append("<div class='tasks-container'></div>");
    	this.$(".card-title").html(this.model.get("title"))
        this.createTasks();
    },
    "createTasks": function() {

    }
}, {

});
