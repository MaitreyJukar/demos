(function (JSONCreator) {
    var Learnosity = JSONCreator.Models.Base.extend({
        defaults: function () {
            return {
                "modelID": _.uniqueId("learno-"),
                "dataReference": null,
                "type": "learnosity"
            };
        },

        initialize: function () {

        }
    }, {

    });

    JSONCreator.Models.Learnosity = Learnosity;
})(window.JSONCreator);