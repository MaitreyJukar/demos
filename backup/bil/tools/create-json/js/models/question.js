(function (JSONCreator) {
    var Question = JSONCreator.Models.Base.extend({
        defaults: function () {
            return {
                "modelID": _.uniqueId("question-"),
                "layouts": new JSONCreator.Collections.Layout(),
                "caption": null,
                "audioID": null,
                "validate": false,
                "__audioIDType": "lang",
                "__id": null,
                "__audioFileChange": null
            };
        },

        initialize: function () {
            this.parseCollections();
            this.listenTo(this, "change:__audioFileChange", function () {
                this.trigger("change:audioID");
            });
        },

        parseCollections: function () {
            this.set("layouts", this.toCollection(this.get("layouts"), JSONCreator.Collections.Layout, JSONCreator.Models.Layout));
        },

        toJSON: function () {
            var data = JSONCreator.Models.Base.prototype.toJSON.apply(this, arguments);
            var __id = this.get("__id");
            if (!data.audioID) {
                data.caption = null;
            }
            if (!data.caption) {
                delete data.caption;
            }
            return data;
        }
    }, {

    });

    JSONCreator.Models.Question = Question;
})(window.JSONCreator);