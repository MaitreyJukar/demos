(function(MyTrello) {
    MyTrello.Views.Card = Backbone.View.extend({
        "initialize": function(options) {
            this.render();
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
        }
    }, {});
})(window.MyTrello);