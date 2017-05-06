/*globals Tasker*/
(function() {
    "use strict";
    Tasker.Collections.Base = Backbone.Collection.extend({

        "initialize": function() {
            this.listenTo(this, 'remove', this._updateModels);
        },
        "_updateModels": function() {
            _.each(this.models, function(model, index) {
                model.set({
                    "order": index + 1
                });
            });
        },
        "updateModelsOnSort": function(indexA, indexB) {
            this.models.splice(indexB, 0, this.models.splice(indexA, 1)[0]);
            this._updateModels();
        }
    });
})();
