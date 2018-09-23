(function (JSONCreator) {
    var resTpl = JSONCreator.Templates.resource;
    var Resource = JSONCreator.Views.Base.extend({
        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
        },

        constructor: function ResourceView() {
            return JSONCreator.Views.Base.prototype.constructor.apply(this, arguments);
        },

        events: function () {
            return {
                "click .delete-media": "onDeleteBtnClicked",
                "change .resource-id": "onResIDChanged",
                "change .resource-name": "onResURLChanged",
                "change .resource-type": "onResTypeChanged"
            };
        },

        attachListeners: function () {
            this.listenTo(this.model, "change:resourceID", this.renderResID);
            this.listenTo(this.model, "change:resourceURL", this.renderResURL);
            this.listenTo(this.model, "change:type", this.renderResType);
        },

        render: function () {
            this.$el.html(resTpl(this.model.toBackboneJSON()));
            return this.renderResID()
                .renderResURL()
                .renderResType();
        },

        renderResID: function () {
            this.$(".resource-id").val(this.model.get("resourceID"));
            return this;
        },

        renderResURL: function () {
            this.$(".resource-name").val(this.model.get("resourceURL"));
            return this;
        },

        renderResType: function () {
            this.$(".resource-type").val(this.model.get("type"));
            return this;
        },

        onDeleteBtnClicked: function () {
            if (window.confirm("Are you sure you want to delete this Resourse?")) {
                this.rekt();
            }
        },

        rekt: function() {
            this.getRekt("resource", this.model.get("__path"));
        },

        onResIDChanged: function () {
            this.model.set("resourceID", this.$(".resource-id").val());
        },

        onResURLChanged: function () {
            this.model.set("resourceURL", this.$(".resource-name").val());
        },

        onResTypeChanged: function () {
            this.model.set("type", this.$(".resource-type").val());
        }
    }, {

    });
    Handlebars.registerHelper("resource", function (data, opts) {
        console.info("resource helper", data, opts);
        return resTpl(data, opts);
    });

    JSONCreator.Views.Resource = Resource;
})(window.JSONCreator);