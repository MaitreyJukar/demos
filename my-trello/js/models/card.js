(function(MyTrello) {
    MyTrello.Models.Card = Backbone.Model.extend({
        "defaults": function() {
            return {
                "cardID": null,
                "name": null,
                "listID": null,
                "position": null,
            };
        },

        "initialize": function() {

        }
    }, {});
})(window.MyTrello);