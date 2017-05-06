Tasker.Views.Task = Backbone.View.extend({
    "initialize": function() {
        this.render();
    },
    "render": function() {
        this.createTask();
    },
    "createTask": function() {
        this.$el.append("<div class='task-content'>" + this.model.get("content") + "</div>");
    }
}, {

});
