(function(MyTrello) {
    var Communicator = Backbone.Model.extend({}, {
        "EVENTS": {
            "APPEND_TO_LIST": 1
        }
    });
    MyTrello.Communicator = new Communicator();
})(window.MyTrello)