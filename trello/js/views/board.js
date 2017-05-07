Tasker.Views.Board = Backbone.View.extend({
    "initialize": function() {
        this.cardCollectionView = [];
        this.render();
        this.listenTo(this.model.get("cardCollection"), "remove", this.deleteCard)
    },
    "events": {
        "click .add-card": "addCard"
    },
    "render": function() {
        this.createCards();
        this.makeCardsSortable();
    },
    "addCard": function(event) {
        var title = this.$(".card-title-control").html();
        if (title === '') {
            return;
        }
        this.createCard(null, title, this.model.get("cardCollection").length);
        this.$(".card-title-control").html("");
    },
    "createCards": function() {
        _.each(this.model.get("cardCollection").models, function(cardModel, index) {
            this.cardCollectionView.push(this.createCard(cardModel, null, index));
        }, this);
    },
    "createCard": function(model, title, order) {
        var cardModel = model,
            cardEl = this.$el.find(".card-container").append("<div id='card-" + order + "' class='card'></div>");
        if (!model) {
            cardModel = new Tasker.Models.Card({
                "title": title,
                "order": order
            });
            this.model.get("cardCollection").add(cardModel);
        }
        return new Tasker.Views.Card({
            "model": cardModel,
            "el": this.$(".card").last()
        });
    },
    "makeCardsSortable": function() {
        this.$el.find(".card-container").sortable({
            "items": ".card",
            "axis": "x"
        });
    },
    "deleteCard": function(model) {
        var cardIndex = model.get("order");
        this.cardCollectionView[cardIndex].remove();
        this.cardCollectionView.splice(cardIndex, 1);
    }
}, {

});
