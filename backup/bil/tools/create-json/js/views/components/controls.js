(function (JSONCreator) {
    var ctrlTpl = JSONCreator.Templates.controls;
    var Controls = JSONCreator.Views.Base.extend({
        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
        },

        events: function () {
            return {
                /* "change .data-ref": "onDataRefIDChanged" */
            };
        },

        rekt: function() {
            this.boom();
        },

        attachListeners: function () {
            /* this.listenTo(this.model, "change:dataReference", this.renderDataRefID); */
        },

        render: function () {
            var dataTpl = JSON.parse(JSON.stringify(this.model.toBackboneJSON()));
            this.$el.html(ctrlTpl(dataTpl));
            return this;
        }
    }, {

    });

    JSONCreator.Views.Controls = Controls;
})(window.JSONCreator);