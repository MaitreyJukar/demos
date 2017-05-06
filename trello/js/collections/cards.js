/*globals Tasker*/
(function() {
    "use strict";
    Tasker.Collections.Cards = Backbone.Collection.extend({

        "initialize": function() {
            this.listenTo(this, 'remove', this._updateModels);
        },
        "_updateModels": function() {
            _.each(this.models, function(model, index) {
                model.set({
                    "order": index + 1
                });
            });
        }
    });
})();
