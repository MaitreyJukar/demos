(function(MyTrello) {
    MyTrello.Views.List = Backbone.View.extend({
        "initialize": function(options) {
            this.render();
        },

        "render": function() {
            this.renderList();
            this.addName();
            this.renderCards();
        },

        "renderList": function() {
            this.setElement($('.templates .list').clone());
        },

        "addName": function() {
            var name = this.model.get('name');
            this.$('.list-title').val(name);
            this.$('.list-title-placeholder').html(name);
        },

        "renderCards": function() {
            var $cardHolder = this.$el.find('.card-holder'),
                i = 0,
                cards = this.model.getCards();
            for (; i < cards.length; i++) {
                $cardHolder.append(new MyTrello.Views.Card({
                    "model": cards[i]
                }).$el);
            }
        }
    }, {});

})(window.MyTrello);