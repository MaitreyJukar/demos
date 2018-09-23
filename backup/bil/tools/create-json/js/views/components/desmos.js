(function (JSONCreator) {
    var dsTpl = JSONCreator.Templates.desmos;
    var Desmos = JSONCreator.Views.Base.extend({
        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
        },

        events: function () {
            return {
                "change .desmos-url": "onDesmosURLChanged",
                "change .desmos-type": "onTypeChanged"
            };
        },

        rekt: function() {
            this.boom();
        },

        attachListeners: function () {
            this.listenTo(this.model, "change:desmosURL", this.renderDesmosURL);
            this.listenTo(this.model, "change:desmosType", this.renderDesmosType);
        },

        render: function () {
            var dataTpl = JSON.parse(JSON.stringify(this.model.toBackboneJSON()));
            this.$el.html(dsTpl(dataTpl));
            return this.renderDesmosURL()
                .renderDesmosType();
        },

        renderDesmosURL: function () {
            this.$(".desmos-url").val(this.model.get("desmosURL"));
            return this;
        },

        renderDesmosType: function () {
            this.$(".desmos-type").val(this.model.get("desmosType"));
            return this;
        },

        onDesmosURLChanged: function () {
            this.model.set("desmosURL", this.$(".desmos-url").val());
        },

        onTypeChanged: function () {
            this.model.set("desmosType", this.$(".desmos-type").val());
        }
    }, {

    });

    JSONCreator.Views.Desmos = Desmos;
})(window.JSONCreator);