(function (JSONCreator) {
    var Component = JSONCreator.Models.Base.extend({
        defaults: function () {
            return {
                "modelID": _.uniqueId("component-"),
                "type": null,
                "subType": null,
                "data": null,
                "dataModel": null,
                "__path": null
            };
        },

        initialize: function () {

        },

        getType: function () {
            var type = this.get("type");
            return type && type === "custom" ? this.get("subType") : type;
        },

        setType: function (type) {
            if (["grid"].indexOf(type) > -1) {
                this.set({
                    "type": "custom",
                    "subType": type
                });
            } else {
                this.set("type", type);
            }
        },

        getType: function () {
            var type = this.get("type");
            return type && type === "custom" ? this.get("subType") : type;
        },

        setType: function (type) {
            if(Component.CUSTOM.indexOf(type) > -1){
                this.set({
                    "type": "custom",
                    "subType": type
                });
            } else {
                this.set({
                    "type": type,
                    "subType": null
                });
            }
        },

        toJSON: function () {
            if (this.get("dataModel")) {
                var data = this.get("dataModel").toJSON();
                delete data.__path;
                return data;
            } else {
                return JSONCreator.Models.Base.prototype.toJSON.apply(this, arguments);
            }
        }
    }, {
        CUSTOM: ["grid"]
    });
    JSONCreator.Models.Component = Component;
})(window.JSONCreator);