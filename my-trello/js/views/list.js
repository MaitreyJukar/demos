(function(MyTrello) {
    MyTrello.Views.List = Backbone.View.extend({
        "initialize": function(options) {
            this.setInitialValues();
            this.render();
        },

        "events": {
            "click .add-card-button": "showAddCardBox",
            "click .add-card-save": "addNewCard",
            "click .add-card-cancel": "closeAddCardBox",
            "click .list-title-placeholder": "editListTitle",
            "blur .list-title": "updateListTitle",
            "click .list-delete-button": "deleteList"
        },

        "setInitialValues": function() {
            this.cards = [];
        },

        "addCard": function(cardData) {
            var model = this.model.addCard(cardData),
                view = new MyTrello.Views.Card({
                    "model": model
                });
            this.cards.push(view);
            this.$('.card-holder').append(view.$el)
        },

        "render": function() {
            this.renderList();
            this.addName();
            this.renderCards();
        },

        "renderList": function() {
            this.setElement($('.templates .list').clone());
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
        },

        "addName": function() {
            var name = this.model.get('name');
            this.$('.list-title').val(name);
            this.$('.list-title-placeholder').html(name);
        },

        "showAddCardBox": function() {
            this.$('.add-card-box').addClass('editing');
            this.$('.add-card-name').focus();
        },

        "addNewCard": function() {
            if (this.$('.add-card-name').val()) {
                this.addCard({
                    "name": this.$('.add-card-name').val(),
                    "position": this.model.get("cardCollection").length
                });
                this.closeAddCardBox();
            }
        },

        "closeAddCardBox": function() {
            this.$('.add-card-box').removeClass('editing');
            this.$('.add-card-name').val('');
        },

        "editListTitle": function() {
            this.$el.addClass('editing');
            this.$('.list-title').focus();
        },

        "updateListTitle": function() {
            this.model.set('name', this.$('.list-title').val());
            this.addName();
            this.$el.removeClass('editing');
        },

        "deleteList": function(){
            this.model.deleteList();
            this.stopListening();
            this.remove();
        }
    }, {});

})(window.MyTrello);