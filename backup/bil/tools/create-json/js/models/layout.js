(function (JSONCreator) {
    var Layout = JSONCreator.Models.Base.extend({
        defaults: function () {
            return {
                "modelID": _.uniqueId("layout-"),
                "multi": false,
                "components": new JSONCreator.Collections.Component(),
                "lcomponents": {
                    components: new JSONCreator.Collections.Component(),
                    width: null
                },
                "rcomponents": {
                    components: new JSONCreator.Collections.Component(),
                    width: null
                },
                "_lwidth": null,
                "_rwidth": null
            };
        },

        initialize: function () {
            this.parseCollections();
            var lWidth = this.get("lcomponents").width;
            var rWidth = this.get("rcomponents").width;
            if (lWidth) {
                this.set("_lwidth", lWidth);
            }
            if (rWidth) {
                this.set("_rwidth", rWidth);
            }
            this.setPathsOfComponents();
            this.attachSelfListeners();
        },

        parseCollections: function () {
            if (this.get("multi")) {
                var lcomponents = this.get("lcomponents");
                lcomponents.components = this.toCollection(lcomponents.components, JSONCreator.Collections.Component, JSONCreator.Models.Component);
                var rcomponents = this.get("rcomponents");
                rcomponents.components = this.toCollection(rcomponents.components, JSONCreator.Collections.Component, JSONCreator.Models.Component);
            } else {
                this.set("components", this.toCollection(this.get("components"), JSONCreator.Collections.Component, JSONCreator.Models.Component));
            }
        },

        setPathsOfComponents: function () {
            var lcomponents = this.get("lcomponents").components;
            for (var i = 0; i < lcomponents.models.length; i++) {
                lcomponents.models[i].set("__path", "lcomponents.components");
            }
            var rcomponents = this.get("rcomponents").components;
            for (var i = 0; i < rcomponents.models.length; i++) {
                rcomponents.models[i].set("__path", "rcomponents.components");
            }
            var components = this.get("components");
            for (var i = 0; i < components.models.length; i++) {
                components.models[i].set("__path", "components");
            }
        },

        attachSelfListeners: function () {
            this.listenTo(this, "change:_lwidth", function () {
                var lComponents = this.get("lcomponents");
                lComponents.width = this.get("_lwidth");
                this.set("lcomponents", lComponents);
            });
            this.listenTo(this, "change:_rwidth", function () {
                var rComponents = this.get("rcomponents");
                rComponents.width = this.get("_rwidth");
                this.set("rcomponents", rComponents);
            });
        },

        toJSON: function () {
            var data = JSONCreator.Models.Base.prototype.toJSON.apply(this, arguments);
            /* data = JSON.parse(JSON.stringify(data)); */
            if (data.multi) {
                data.components = [];
            } else {
                data.lcomponents.components = [];
                data.rcomponents.components = [];
            }
            delete data._rwidth;
            delete data._lwidth;
            return data;
        }
    }, {

    });

    JSONCreator.Models.Layout = Layout;
})(window.JSONCreator);