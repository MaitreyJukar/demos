(function (JSONCreator) {
    var lrnTpl = JSONCreator.Templates.learnosity;
    var Learnosity = JSONCreator.Views.Base.extend({
        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
        },

        events: function () {
            return {
                "change .data-ref": "onDataRefIDChanged"
            };
        },

        attachListeners: function () {
            this.listenTo(this.model, "change:dataReference", this.renderDataRefID);
        },

        rekt: function() {
            this.boom();
        },

        render: function () {
            var dataTpl = JSON.parse(JSON.stringify(this.model.toBackboneJSON()));
            this.$el.html(lrnTpl(dataTpl));
            return this.renderDataRefID();
        },

        renderDataRefID: function () {
            this.$(".data-ref").val(this.model.get("dataReference"));
            return this;
        },

        onDataRefIDChanged: function () {
            this.model.set("dataReference", this.$(".data-ref").val());
        }
    }, {

    });

    JSONCreator.Views.Learnosity = Learnosity;
})(window.JSONCreator);