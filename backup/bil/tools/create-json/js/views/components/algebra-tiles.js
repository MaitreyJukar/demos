(function (JSONCreator) {
    var atTpl = JSONCreator.Templates["algebra-tiles"];
    var AlgebraTiles = JSONCreator.Views.Base.extend({
        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
        },

        events: function () {
            return {
                "change .x-vert": "onVertialXCoeffChanged",
                "change .x-vert-const": "onVertialXConstChanged",
                "change .x-horiz": "onHorizXCoeffChanged",
                "change .x-horiz-const": "onHorizXConstChanged",
                "change .show-solution": "onShowSolutionChanged",
                "change .alge-type": "onTypeChanged"
            };
        },

        attachListeners: function () {
            this.listenTo(this.model, "change:_vertXCoeff", this.renderVertXCoeff);
            this.listenTo(this.model, "change:_vertXConst", this.renderVertXConst);
            this.listenTo(this.model, "change:_horizXCoeff", this.renderHorizXCoeff);
            this.listenTo(this.model, "change:_horizXConst", this.renderHorizXConst);
            this.listenTo(this.model, "change:__showSolution", this.renderShowSolution);
            this.listenTo(this.model, "change:__type", this.renderType);
        },

        render: function () {
            var dataTpl = this.model.toBackboneJSON();
            this.$el.html(atTpl(dataTpl));
            return this.renderVertXCoeff()
                .renderVertXConst()
                .renderHorizXCoeff()
                .renderHorizXConst()
                .renderShowSolution()
                .renderType();
        },

        rekt: function () {
            this.boom();
        },

        renderVertXCoeff: function () {
            this.$(".x-vert").val(this.model.get("_vertXCoeff"));
            return this;
        },

        renderVertXConst: function () {
            this.$(".x-vert-const").val(this.model.get("_vertXConst"));
            return this;
        },

        renderHorizXCoeff: function () {
            this.$(".x-horiz").val(this.model.get("_horizXCoeff"));
            return this;
        },

        renderHorizXConst: function () {
            this.$(".x-horiz-const").val(this.model.get("_horizXConst"));
            return this;
        },

        renderShowSolution: function () {
            var isChecked = this.model.get("__showSolution");
            this.$(".show-solution").prop("checked", isChecked);
            return this;
        },

        renderType: function () {
            this.$(".alge-type").val(this.model.get("__type"));
            return this;
        },

        onVertialXCoeffChanged: function () {
            this.model.set("_vertXCoeff", this.$(".x-vert").val());
        },

        onVertialXConstChanged: function () {
            this.model.set("_vertXConst", this.$(".x-vert-const").val());
        },

        onHorizXCoeffChanged: function () {
            this.model.set("_horizXCoeff", this.$(".x-horiz").val());
        },

        onHorizXConstChanged: function () {
            this.model.set("_horizXConst", this.$(".x-horiz-const").val());
        },

        onShowSolutionChanged: function () {
            this.model.set("__showSolution", this.$(".show-solution").prop("checked"));
        },

        onTypeChanged: function () {
            this.model.set("__type", this.$(".alge-type").val());
        }
    }, {

    });

    JSONCreator.Views.AlgebraTiles = AlgebraTiles;
})(window.JSONCreator);