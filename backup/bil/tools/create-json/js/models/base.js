(function (JSONCreator) {
    var Base = Backbone.Model.extend({
        defaults: function () {
            return {

            };
        },

        toCollection: function (entities, CollectionType, ModelType, extraModelData) {
            if (!(entities instanceof CollectionType)) {
                var collection = new CollectionType();
                if (entities) {
                    for (var i = 0; i < entities.length; i++) {
                        var currEntry = entities[i];
                        if (extraModelData) {
                            currEntry = $.extend(true, currEntry, extraModelData);
                        }
                        collection.add(new ModelType(currEntry));
                    }
                }
                entities = collection;
            }
            return entities;
        },

        toBackboneJSON: function () {
            return Backbone.Model.prototype.toJSON.apply(this, arguments);
        },

        toJSON: function () {
            var data = this.toBackboneJSON.apply(this, arguments);
            for (var key in data) {
                if (data.hasOwnProperty(key) && key.indexOf("__") === 0 && JSONCreator.Models.Base.TO_JSON_EXCEPTIONS.indexOf(key) === -1) {
                    delete data[key];
                }
            }
            delete data.modelID;
            return data;
        },

        detonate: function () {
            this.trigger("detonate");
        }
    }, {
        TO_JSON_EXCEPTIONS: ["__id", "__tooltipImgFile"]
    });

    JSONCreator.Models.Base = Base;
})(window.JSONCreator);