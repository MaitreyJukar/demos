(function(MyTrello) {
    MyTrello.Models.Base = Backbone.Model.extend({
        "save": function() {
            MyTrello.Communicator.trigger(MyTrello.Communication.EVENTS.SAVE);
        }
    }, {});
})(window.MyTrello);