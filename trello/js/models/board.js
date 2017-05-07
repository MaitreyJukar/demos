/*globals Tasker*/
(function() {
    "use strict";
    Tasker.Models.Board = Backbone.Model.extend({
        "defaults": function() {
            return {
                "numberOfCard": 0,
                "title": "",
                "order": 0,
                "cardCollection": null
            }
        },
        "initialize": function(options) {
            this.set("cardCollection", new Tasker.Collections.Cards())
            this.populateTasks(options.cards);
            this.listenTo(this.get("cardCollection"), "setActiveSortData", this.setActiveSortData);
            this.listenTo(this.get("cardCollection"), "getActiveCardData", this.getActiveCardData)
        },
        "populateTasks": function(cards) {
            var cardCollection = this.get("cardCollection");
            _.each(cards, function(card) {
                cardCollection.add(new Tasker.Models.Card(card));
            });
        },
        "setActiveSortData": function(json) {
            this.set("activeSortData", json);
        },
        "getActiveCardData": function(model) {
            model.set("activeTaskData", this.get("activeSortData"));
        },
        "saveData": function() {
            var taskerData = {};
            taskerData.cards = this.get("cardCollection").saveData();
            localStorage.setItem("trelloData", JSON.stringify(taskerData));
        }
    });
})();
