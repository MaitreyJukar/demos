(function(MyTrello) {
    MyTrello.Models.Dashboard = MyTrello.Models.Base.extend({
        "defaults": function() {
            return {
                "lists": new MyTrello.Collections.List(),
                "listIDGenerator": 0
            }
        },

        "initialize": function() {
            this.fetchSavedData();
            this.attachListeners();
        },

        "generateNewID": function() {
            var ID = this.get('listIDGenerator');
            this.set('listIDGenerator', ID + 1);
            return ID;
        },

        /**** DATA FETCHING AND PARSING ****/

        "fetchSavedData": function() {
            this.parseSavedData();
        },

        "parseSavedData": function() {
            var trelloData = JSON.parse(localStorage.getItem('mytrello') || '{}', this.dataParser),
                i = 0;
            trelloData.lists = trelloData.lists || [];
            for (; i < trelloData.lists.length; i++) {
                this.addList(trelloData.lists[i]);
            }
            this.set("listIDGenerator", trelloData.listIDGenerator || 0);
        },

        "dataParser": function(key, value) {
            switch (key) {
                case "cardCollection":
                    {
                        this.cards = value;
                        return void 0;
                    }
                case "commentCollection":
                    {
                        this.comments = value;
                        return void 0;
                    }
                default:
                    return value;
            }
        },

        "attachListeners": function() {
            this.listenTo(MyTrello.Communicator, MyTrello.Communication.EVENTS.SAVE, this.saveAllData.bind(this));
        },

        "saveAllData": function() {
            this.updateSavedData(JSON.stringify(this.toJSON(), this.saveDataReplacer));
        },

        "saveDataReplacer": function(key, value) {
            return value;
        },

        "updateSavedData": function(data) {
            localStorage.setItem('mytrello', data);
        },

        "addList": function(listData) {
            var model = new MyTrello.Models.List(listData);
            this.get('lists').add(model);
            this.save();
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