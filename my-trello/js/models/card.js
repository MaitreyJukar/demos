(function(MyTrello) {
    MyTrello.Models.Card = MyTrello.Models.Base.extend({
        "defaults": function() {
            return {
                "cardID": null,
                "name": null,
                "listID": null,
                "position": null,
                "commentCollection": new MyTrello.Collections.Comment()
            };
        },

        "initialize": function(options) {
            this.addComments(options.comments || []);
        },

        "addComments": function(comments) {
            var commentCollection = this.get("commentCollection");
            for (var i = 0; i < comments.length; i++) {
                commentCollection.add(new MyTrello.Models.Comment(comments[i]));
            }
        },

        "removeCommentAt": function(index){
            this.get("commentCollection").at(index).destroy();
        },

        "deleteCard": function() {
            this.destroy();
        }
    }, {});
})(window.MyTrello);