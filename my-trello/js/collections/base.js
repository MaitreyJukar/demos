(function(MyTrello) {
    MyTrello.Collections.Base = Backbone.Collection.extend({
        "initialize": function() {
            this.listenTo(this, 'remove', this._updateModels);
            this.listenTo(this, 'destroy', this._updateModels);
        },
        "_updateModels": function() {
            _.each(this.models, function(model, idx) {
                model.set({
                    "position": idx
                });
            });
            MyTrello.Communicator.trigger(MyTrello.Communication.EVENTS.SAVE);
        },
        "updateModelsOnSort": function(idxA, idxB) {
            this.models.splice(idxB, 0, this.models.splice(idxA, 1)[0]);
            this._updateModels();
        }
    }, {});
})(window.MyTrello);