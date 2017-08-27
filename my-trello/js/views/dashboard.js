(function(MyTrello) {
    MyTrello.Views.Dashboard = Backbone.View.extend({
        "initialize": function() {
            this.initializeViewCollection();
            this.renderComponents();
            this.attachListeners();
            this.makeListsSortable();
        },

        "events": {
            "click .add-list-button": "showAddListBox",
            "click .add-list-save": "addNewList",
            "click .add-list-cancel": "closeAddListBox"
        },

        "initializeViewCollection": function() {
            this.lists = [];
        },

        /**** COMPONENT RENDERING ****/

        "renderComponents": function() {
            this.renderLists();
        },

        "renderLists": function() {
            var lists = this.model.getLists(),
                i = 0;
            if (lists && lists.length) {
                for (; i < lists.length; i++) {
                    this.addList(lists[i]);
                }
            }
        },

        "addList": function(listData) {
            var model = this.model.addList(listData),
                view = new MyTrello.Views.List({
                    "model": model
                });
            this.lists.push(view);
            this.$('.list-holder').append(view.$el)
        },

        /**** EVENT LISTENERS ****/

        "attachListeners": function() {
            $('body').on('removelist', this.removeList.bind(this));
        },

        "makeListsSortable": function() {
            this.$(".list-holder").sortable({
                "items": ".list",
                "axis": "x",
                "scrollSensitivty": 50,
                "start": function(event, ui) {

                },
                "stop": function(event, ui) {

                }
            });
        },

        "removeList": function(list) {
            this.model.removeList(list.model);
        },

        "showAddListBox": function() {
            this.$('.add-list-box').addClass('editing');
            this.$('.add-list-name').focus();
        },

        "addNewList": function() {
            if (this.$('.add-list-name').val()) {
                this.addList({
                    "name": this.$('.add-list-name').val(),
                    "position": this.model.get("lists").length
                });
                this.closeAddListBox();
            }
        },

        "closeAddListBox": function() {
            this.$('.add-list-box').removeClass('editing');
            this.$('.add-list-name').val('');
        }
    }, {});


})(window.MyTrello);