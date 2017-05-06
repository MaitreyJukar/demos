Tasker.Views.Board = Backbone.View.extend({
    "initialize": function() {
        this.render();
        this.cardCollectionView = [];
    },
    "render": function() {
        this.createCards();
        this.makeCardsSortable();
    },
    "createCards": function() {
        _.each(this.model.get("cardCollection"), function(cardModel, index) {
            this.cardCollectionView.push(this.createCard(cardModel, null, index));
        });
    },
    "createCard": function(model, title, order) {
        var cardModel = model || new Tasker.Models.Card({
                "title": title,
                "order": order
            }),
            cardEl = this.$el.append("<div id='card" + order + "' class='card'></div>");

        return new Tasker.Views.Card({
            "model": cardModel,
            "el": cardEl
        });
    },
    "makeCardsSortable": function() {
        this.$el.sortable({

        });
    }
}, {

});
