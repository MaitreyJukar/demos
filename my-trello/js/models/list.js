(function(MyTrello) {
    MyTrello.Models.List = MyTrello.Models.Base.extend({
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
            this.save();
            return model;
        },

        "getCards": function() {
            return this.get('cardCollection').sortBy("position");
        },

        "addCardToCollection": function(idx, model) {
            var cardCollection = this.get("cardCollection");
            cardCollection.add(model);
            cardCollection.updateModelsOnSort(cardCollection.length - 1, idx);
        },

        "removeCardFromCollection": function(model) {
            this.get("cardCollection").remove(model);
        },

        "deleteList": function() {
            this.destroy();
        }
    }, {});

})(window.MyTrello);