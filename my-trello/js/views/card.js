(function(MyTrello) {
    MyTrello.Views.Card = Backbone.View.extend({
        "initialize": function(options) {
            this.render();
        },

        "events": {
            "click": "openCardDetails",
            "click .card-delete-btn": "deleteCard"
        },

        "render": function() {
            this.renderCard();
            this.addName();
        },

        "renderCard": function() {
            this.setElement($('.templates .card').clone());
        },

        "addName": function() {
            this.$el.find('.card-title').html(this.model.get('name'));
        },

        "openCardDetails": function(event) {
            if (!$(event.target).hasClass('card-delete-btn')) {

            }
        },

        "deleteCard": function(){
            this.model.deleteCard();
            this.stopListening();
            this.remove();
        }
    }, {});
})(window.MyTrello);