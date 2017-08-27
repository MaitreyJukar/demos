(function(MyTrello) {
    MyTrello.Models.List = Backbone.Model.extend({
        "defaults": function() {
            return {
                "listID": null,
                "name": null,
                "position": null,
                "cardCollection": new MyTrello.Collections.Card()
            };
        },

        "initialize": function(options) {
            this.populateCards(options.cards || []);
        },

        "populateCards": function(cards) {
            for (var i = 0; i < cards.length; i++) {
                this.addCard(cards[i]);
            }
        },

        "addCard": function(cardData) {
            var model = new MyTrello.Models.Card(cardData);
            this.get('cardCollection').add(model);
            return model;
        },

        "getCards": function() {
            return _.sortBy(this.get('cardCollection'), "position");
        },

        "deleteList": function(){
            this.destroy();
        }
    }, {});

})(window.MyTrello);