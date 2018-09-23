(function(JSONCreator) {
    var Resource = JSONCreator.Collections.Base.extend({
        model: JSONCreator.Models.Resource,

        removeByID: function(id) {
            for (var i = 0; i < this.models.length; i++) {
                if (this.models[i].get("__extID") === id) {
                    this.models[i].detonate();
                }
            }
        },

        getModelByID: function(id) {
            for (var i = 0; i < this.models.length; i++) {
                if (this.models[i].get("__extID") === id) {
                    return this.models[i];
                }
            }
        },

        getModelByMainID: function(id) {
            for (var i = 0; i < this.models.length; i++) {
                if (this.models[i].get("id") === id) {
                    return this.models[i];
                }
            }
        }
    }, {

    });

    JSONCreator.Collections.Resource = Resource;
})(window.JSONCreator);