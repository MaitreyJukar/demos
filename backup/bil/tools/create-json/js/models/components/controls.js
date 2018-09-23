(function (JSONCreator) {
    var Controls = JSONCreator.Models.Base.extend({
        defaults: function () {
            return {
                "data": null,
                "type": "controls"
            };
        },

        initialize: function () {

        }
    }, {

    });

    JSONCreator.Models.Controls = Controls;
})(window.JSONCreator);