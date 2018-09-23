(function (JSONCreator) {
    var Resource = JSONCreator.Models.Base.extend({
        defaults: function () {
            return {
                "modelID": _.uniqueId("res-"),
                "type": null,
                "resourceURL": null,
                "resourceID": null,
                "idPlaceholder": null,
                "idTitle": null,
                "typeTitle": null,
                "urlTitle": null,
                "urlPlaceholder": null,
                "__path": "",
                "__extID": null,
                "_sType": null
            };
        },

        initialize: function () {
            var id = this.get("id");
            if (id) {
                this.set("resourceID", id);
            }

            var url = this.get("url");
            if (url) {
                this.set("resourceURL", url);
            }

            var oldType = this.get("type");
            if (oldType.indexOf("JSON") !== -1) {
                this.set("__path", "resources.json");
                this.set("_sType", "JSON");
            } else if (oldType.indexOf("AUDIO") !== -1) {
                this.set("__path", "resources.media.audio");
                this.set("_sType", "AUDIO");
            } else if (oldType.indexOf("IMAGE") !== -1) {
                this.set("__path", "resources.media.images");
                this.set("_sType", "IMAGE");
            }
            if (oldType.indexOf("COMMON") !== -1) {
                this.set("type", "common");
            }
            if (oldType.indexOf("LANG") !== -1) {
                this.set("type", "lang");
            }
        },

        toJSON: function () {
            var data = JSONCreator.Models.Base.prototype.toJSON.apply(this, arguments);
            data.url = data.resourceURL;
            delete data.resourceURL;
            data.id = data.resourceID;
            delete data.resourceID;
            delete data.__path;
            delete data._sType;
            delete data.idPlaceholder;
            delete data.idTitle;
            delete data.typeTitle;
            delete data.urlTitle;
            delete data.urlPlaceholder;
            var langType = this.get("type");
            var resType = this.get("_sType");
            data.type = "EXPLORATION_" + langType.toUpperCase() + "_" + resType;
            return data;
        }
    }, {

    });

    JSONCreator.Models.Resource = Resource;
})(window.JSONCreator);