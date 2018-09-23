(function () {
    "use strict";
$.fn.extend({
    customCheckBox: function customCheckBox() {
        this.each(function () {
            var div, $div, $this = $(this), model, view;
            if (this.tagName.toLowerCase() !== "input" || this.type !== "checkbox") {
                return;
            }
            div = document.createElement("div");
            $div = $(div);
            model = new CheckBoxModel();
            model.FormDataStructure(this);
            $div.attr("id", $this.attr("id"));
            $div.attr("style", $this.attr("style"));
            $div.insertBefore($this);
            $this.remove();
            view = new CheckBoxView({
                model: model,
                el: div
            });
        });
        return this;
    }
});
})();
