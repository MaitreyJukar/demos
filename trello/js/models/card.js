/*globals Tasker*/
(function() {
    "use strict";
    Tasker.Models.Card = Backbone.Model.extend({
        "defaults": function() {
            return {
                "numberOfTask": 0,
                "title": "",
                "order": 0,
                "createdBy": "",
                "createdOn": null,
                "taskCollection": null
            }
        },
        "initalize": function(options) {
            this.set("taskCollection", new Tasker.Collections.Task)
            this.populateTasks(options.tasks);
        },
        populateTasks: function(tasks) {
            var taskCollection = this.get("taskCollection");
            _.each(tasks, function(task) {
                taskCollection.add(new Tasker.Models.Task(task));
            });
        }
    });
})();
