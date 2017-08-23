(function(MyTrello) {
    var List = function(options) {
        this.initialize(options);
    };

    List.prototype.initialize = function(options) {
        this.parseData(options);
        this.render();
    };

    List.prototype.parseData = function(options) {
        this.name = options.name;
        this.cards = [];
        this.populateCards(options.cards);
    };

    List.prototype.populateCards = function(cards) {
        if (cards) {
            for (var i = 0; i < cards.length; i++) {
                this.cards.push(new MyTrello.Card(cards[i]));
            }
        }
    };

    List.prototype.render = function() {
        this.renderList();
        this.addName();
        this.renderCards();
    };

    List.prototype.renderList = function() {
        this.$el = $('.templates .list').clone();
    };

    List.prototype.addName = function(){
    	this.$el.find('.list-title').html(this.name);
    };

    List.prototype.renderCards = function() {
        var $cardHolder = this.$el.find('.card-holder'),
            i = 0;
        for (; i < this.cards.length; i++) {
            $cardHolder.append(this.cards[i].$el);
        }
    };

    MyTrello.List = List;

})(window.MyTrello);