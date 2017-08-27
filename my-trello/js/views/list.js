(function(MyTrello) {
    MyTrello.Views.List = Backbone.View.extend({
        "initialize": function(options) {
            this.setInitialValues();
            this.render();
            this.makeCardsSortable();
            this.attachListeners();
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

        "attachListeners": function() {
            this.listenTo(this.model.get("cardCollection"), "destroy", this.updateTaskCounter.bind(this));
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
            this.updateTaskCounter();
        },

        "renderList": function() {
            this.setElement($('.templates .list').clone());
            this.$el.attr('id', 'list-' + this.model.get('listID'));
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

        "makeCardsSortable": function() {
            var startIndex = -1,
                stopIndex = -1,
                totalItems,
                self = this;

            this.$(".card-holder").sortable({
                "items": ".card",
                "connectWith": ".card-holder",
                "activate": function(event, ui) {
                    var currentModel;
                    startIndex = -1;
                    stopIndex = -1;
                    totalItems = self.$el.find(".card:not(.ui-sortable-placeholder)").length;
                    if (ui.sender[0] === self.$el.find('.card-holder')[0]) {
                        startIndex = $(ui.item).index();
                        currentModel = self.model.get("cardCollection").at(startIndex);
                        MyTrello.Communicator.set('currentCardModel', currentModel);
                        MyTrello.Communicator.set('currentCardView', self.cards[startIndex]);
                    }
                },
                "deactivate": function(event, ui) {
                    if (totalItems !== self.$el.find(".card:not(.ui-sortable-placeholder)").length) {
                        if (startIndex > -1) {
                            self.cards.splice(startIndex, 1);
                            self.model.removeCardFromCollection(MyTrello.Communicator.get('currentCardModel'));
                        } else {
                            stopIndex = $(ui.item).index();
                            self.cards.push(MyTrello.Communicator.get('currentCardView'))
                            self.moveAtoB(self.cards.length - 1, stopIndex);
                            self.model.addCardToCollection(stopIndex, MyTrello.Communicator.get('currentCardModel'));
                        }
                    } else if (ui.sender[0] === self.$el.find('.card-holder')[0]) {
                        stopIndex = $(ui.item).index();
                        if (startIndex !== stopIndex) {
                            self.model.get("cardCollection").updateModelsOnSort(startIndex, stopIndex);
                            self.moveAtoB(startIndex, stopIndex);
                        }
                    }
                    self.updateTaskCounter();
                    self.model.save();
                }
            });
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
                    "position": this.model.get("cardCollection").length,
                    "listID": this.model.get("listID")
                });
                this.closeAddCardBox();
                this.updateTaskCounter();
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
            this.model.save();
        },

        "moveAtoB": function(idxA, idxB) {
            this.cards.splice(idxB, 0, this.cards.splice(idxA, 1)[0]);
        },

        "deleteList": function() {
            for (var i = 0; i < this.cards.length; i++) {
                this.cards[i].deleteCard();
            }
            this.model.deleteList();
            this.stopListening();
            this.remove();
        },

        "updateTaskCounter": function() {
            this.$(".task-counter").html(this.model.get("cardCollection").length);
        }
    }, {});

})(window.MyTrello);