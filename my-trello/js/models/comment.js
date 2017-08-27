(function(MyTrello) {
    MyTrello.Models.Comment = MyTrello.Models.Base.extend({
        "defaults": function() {
            return {
                "content": null
            };
        },

        "initialize": function() {

        }
    }, {});
})(window.MyTrello);