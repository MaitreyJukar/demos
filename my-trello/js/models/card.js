(function(MyTrello) {
    MyTrello.Models.Card = MyTrello.Models.Base.extend({
        "defaults": function() {
            return {
                "cardID": null,
                "name": null,
                "listID": null,
                "position": null,
            };
        },

        "initialize": function() {

        },

        "deleteCard": function() {
            this.destroy();
        }
    }, {});
})(window.MyTrello);