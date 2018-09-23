(function (JSONCreator) {
    var htmlTpl = JSONCreator.Templates.html;
    var HTML = JSONCreator.Views.Base.extend({
        initialize: function () {
            JSONCreator.Views.Base.prototype.initialize.apply(this, arguments);
            this.attachListeners();
            this.render();
        },

        events: function () {
            return {
                "change .inner-html": "onInnerHTMLChanged",
                "change .css-class": "onCSSClassChanged"
            };
        },

        rekt: function() {
            this.boom();
        },

        attachListeners: function () {
            this.listenTo(this.model, "change:innerHTML", this.renderInnerHTML);
            this.listenTo(this.model, "change:cssClass", this.renderCSSClass);
        },

        render: function () {
            var dataTpl = JSON.parse(JSON.stringify(this.model.toBackboneJSON()));
            this.$el.html(htmlTpl(dataTpl));
            return this.renderInnerHTML()
                .renderCSSClass();
        },

        renderInnerHTML: function () {
            this.$(".inner-html").val(this.model.get("innerHTML"));
            return this;
        },

        renderCSSClass: function () {
            this.$(".css-class").val(this.model.get("cssClass"));
            return this;
        },

        onInnerHTMLChanged: function () {
            console.info("onInnerHTMLChanged", this.$(".inner-html").val());
            this.model.set("innerHTML", this.$(".inner-html").val());
        },

        onCSSClassChanged: function () {
            this.model.set("cssClass", this.$(".css-class").val());
        }
    }, {

    });

    JSONCreator.Views.HTML = HTML;
})(window.JSONCreator);