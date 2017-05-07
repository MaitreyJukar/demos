/*globals Tasker*/
(function() {
    "use strict";
    Tasker.Collections.Tasks = Tasker.Collections.Base.extend({
        "saveData": function() {
            var tasks = [];
            _.each(this.models, function(taskeModel) {
                var task = {};
                task.content = taskeModel.get("content");
                task.order = taskeModel.get("order");
                task.comments = taskeModel.get("commentCollection").saveData();
                tasks.push(task);
            });
            return tasks;
        }
    });
})();
