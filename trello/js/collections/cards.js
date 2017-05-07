/*globals Tasker*/
(function() {
    "use strict";
    Tasker.Collections.Cards = Tasker.Collections.Base.extend({
        "saveData": function() {
            var cards = [];
            _.each(this.models, function(cardModel) {
                var card = {};
                card.title = cardModel.get("title");
                card.order = cardModel.get("order");
                card.tasks = cardModel.get("taskCollection").saveData();
                cards.push(card);
            });
            return cards;
        }
    });
})();
