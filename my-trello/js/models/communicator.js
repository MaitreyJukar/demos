(function(MyTrello) {
    MyTrello.Communication = MyTrello.Models.Base.extend({}, {
        "EVENTS": {
            "SAVE": 1
        }
    });
    MyTrello.Communicator = new MyTrello.Communication();
})(window.MyTrello)