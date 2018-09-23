(function (JSONCreator) {
    var Base = Backbone.View.extend({
        initialize: function() {
            this.addDetonateListener();
        },

        addDetonateListener: function() {
            this.listenTo(this.model, "detonate", this.rekt);
        },

        rekt: function() {
            console.warn("[Base rekt method invocation] Please override this function in Inherited view.");
        },

        getRekt: function (type, path) {
            this.trigger("got-rekt", this, type, path);
        },

        attachRektListener: function (view) {
            this.listenTo(view, "got-rekt", this.onRekt);
        },

        onRekt: function (view, type, path) {
            console.info("onRekt", type, path);
            var paths = path.split(".");
            var obj = this.model.attributes;
            for (var i = 0; i < paths.length; i++) {
                obj = obj[paths[i]];
            }
            obj.remove([view.model]);
            view.boom();
        },

        boom: function () {
            this.undelegateEvents();
            this.remove();
        },

        disableInput: function (input) {
            if (typeof input === "string") {
                this.$(input).attr("disabled", "disabled").attr("aria-disabled", "true");
            } else if (typeof input === "object") {
                $(input).attr("disabled", "disabled").attr("aria-disabled", "true");
            }
            return this;
        },

        enableInput: function (input) {
            if (typeof input === "string") {
                this.$(input).removeAttr("disabled").attr("aria-disabled", "false");
            } else if (typeof input === "object") {
                $(input).removeAttr("disabled").attr("aria-disabled", "false");
            }
            return this;
        }
    }, {

    });
    JSONCreator.Views.Base = Base;
})(window.JSONCreator);