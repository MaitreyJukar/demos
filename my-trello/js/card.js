(function(MyTrello) {
    var Card = function(options) {
        this.initialize(options);
    };

    Card.prototype.initialize = function(options) {
        this.parseData(options);
        this.render();
    };

    Card.prototype.parseData = function(options) {
        this.name = options.name;
    };

    Card.prototype.render = function() {
        this.renderCard();
        this.addName();
    };

    Card.prototype.renderCard = function() {
        this.$el = $('.templates .card').clone();
    };

    Card.prototype.addName = function(){
        this.$el.find('.card-title').html(this.name);
    };

    MyTrello.Card = Card;

})(window.MyTrello);