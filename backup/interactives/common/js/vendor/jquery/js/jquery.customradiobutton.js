(function () {"use strict";
    $.fn.extend({
        customRadioButton: function customRadioButton () {
            var $RadioButtons = $();
            this.each(function () {
                var div, $div, $this = $(this), model, view;
                if (this.tagName.toLowerCase() !== "input" || this.type !== "radio") {
                    return;
                }
                div = document.createElement("div");
                $div = $(div);
                model = new RadioButtonModel ();
                model.FormDataStructure(this);
                $div.attr("id", $this.attr("id"));
                $div.attr("style", $this.attr("style"));
                $div.insertBefore($this);
                $this.remove();
                view = new RadioButtonView ({
                    model: model,
                    el: div
                });
                $RadioButtons.add($this);
            });
            return $RadioButtons;
        }
    });
})();
