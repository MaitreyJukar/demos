(function(MyTrello) {
    var Dashboard = function() {
        this.initialize();
    };

    Dashboard.prototype.initialize = function() {
        this.setInitialData();
        this.fetchSavedData();
        this.renderComponents();
        this.attachListeners();
    };

    Dashboard.prototype.setInitialData = function() {
        this.lists = [];
    };

    /**** DATA FETCHING AND PARSING ****/

    Dashboard.prototype.fetchSavedData = function() {
        this.parseSavedData();
    };

    Dashboard.prototype.parseSavedData = function() {
        var trelloData = localStorage.getItem('mytrello');
        if (trelloData) {
            this.trelloData = JSON.parse(trelloData);
        } else {
            this.trelloData = {

            };
        }
    };

    Dashboard.prototype.updateSavedData = function() {
        localStorage.setItem('mytrello', JSON.stringify(this.trelloData));
    };

    /**** COMPONENT RENDERING ****/

    Dashboard.prototype.renderComponents = function() {
        this.renderAddListBox();
        this.renderLists();
    };

    Dashboard.prototype.renderAddListBox = function() {
        this.addListBox
    };

    Dashboard.prototype.renderLists = function() {
        var lists = this.trelloData.lists,
            i = 0;
        if (lists && lists.length) {
            for (; i < lists.length; i++) {
                this.addList(lists[i]);
            }
        }
    };

    Dashboard.prototype.addList = function(listData) {
        this.lists.push(new MyTrello.List(listData));
    };

    /**** EVENT LISTENERS ****/

    Dashboard.prototype.attachListeners = function() {
        $('body').on('removelist', this.removeList.bind(this));
        $('.add-list-button').on('click', this.showAddListBox.bind(this));
        $('.add-list-save').on('click', this.addNewList.bind(this));
        $('.add-list-cancel').on('click', this.closeAddListBox.bind(this));
    };

    Dashboard.prototype.removeList = function(list) {
        if (this.lists.indexOf(list) > -1) {
            this.lists.splice(list, 1);
        }
    };

    Dashboard.prototype.showAddListBox = function() {

    };

    Dashboard.prototype.addNewList = function() {

    };

    Dashboard.prototype.closeAddListBox = function() {

    };

    MyTrello.Dashboard = Dashboard;


})(window.MyTrello);