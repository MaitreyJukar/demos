(function (JSONCreator) {
    var HTML = JSONCreator.Models.Base.extend({
        defaults: function () {
            return {
                "modelID": _.uniqueId("html-comp-"),
                "cssClass": null,
                "type": "html",
                "data": null,
                "innerHTML": null
            };
        },

        initialize: function () {

        }
    }, {

    });

    JSONCreator.Models.HTML = HTML;
})(window.JSONCreator);