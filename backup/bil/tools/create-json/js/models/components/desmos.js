(function (JSONCreator) {
    var Desmos = JSONCreator.Models.Base.extend({
        defaults: function () {
            return {
                "modelID": _.uniqueId("desmos-"),
                "data": null,
                "desmosType": null,
                "desmosURL": null,
                "type": "desmos"
            };
        },

        initialize: function () {

        }
    }, {

    });

    JSONCreator.Models.Desmos = Desmos;
})(window.JSONCreator);