(function(MyTrello) {
    MyTrello.Models.Dashboard = Backbone.Model.extend({
        "defaults": function() {
            return {
                "lists": new MyTrello.Collections.List()
            }
        },

        "initialize": function() {
            this.fetchSavedData();
        },

        /**** DATA FETCHING AND PARSING ****/

        "fetchSavedData": function() {
            this.parseSavedData();
        },

        "parseSavedData": function() {
            var trelloData = JSON.parse(localStorage.getItem('mytrello') || '{}'),
                i = 0;
            trelloData.lists = trelloData.lists || [];
            for (; i < trelloData.lists.length; i++) {
                this.addList(trelloData.lists[i]);
            }
        },

        "updateSavedData": function() {
            localStorage.setItem('mytrello', JSON.stringify(this.trelloData));
        },

        "addList": function(listData) {
            var model = new MyTrello.Models.List(listData);
            this.get('lists').add(model);
            return model;
        },

        "removeList": function(model) {
            this.get('lists').remove(model);
            model.destroy();
        },

        "getLists": function() {
            return _.sortBy(this.get("lists").models, "position");
        }

    }, {});


})(window.MyTrello);