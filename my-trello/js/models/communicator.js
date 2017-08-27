(function(MyTrello) {
    MyTrello.Communication = MyTrello.Models.Base.extend({}, {
        "EVENTS": {
            "SAVE": 1,
            "SHOW_DETAILS": 2
        }
    });
    MyTrello.Communicator = new MyTrello.Communication();
})(window.MyTrello)