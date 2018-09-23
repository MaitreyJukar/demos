(function (JSONCreator) {
    var Base = Backbone.Collection.extend({
        addItem: function (data) {
            this.add(data);
        },

        getModelIndex: function (model) {
            var index = -1;
            for (var i = 0; i < this.models.length; i++) {
                if (this.models[i] === model) {
                    index = i;
                    break;
                }
            }
            return index;
        }
    }, {

    });

    JSONCreator.Collections.Base = Base;
})(window.JSONCreator);