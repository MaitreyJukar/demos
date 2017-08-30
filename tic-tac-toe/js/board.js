var Board = function() {
    this.init();
    this.attachEvents();
    this.start("x");
};

Board.prototype.init = function() {
    this.$el = $('.board');
    this.xPos = 0;
    this.oPos = 0;
    this.xTurn = true;
};

Board.prototype.attachEvents = function() {
    $('.tile').on('click', this.onTileClick.bind(this));
};

Board.prototype.start = function(symbol) {
    this.bot = new Bot({
        "symbol": symbol
    });
    this.botBool = symbol === "x";
    if (this.botBool) {
        this.bot.play();
    }
};

Board.prototype.onTileClick = function(event) {
    var $target = $(event.currentTarget),
        pow, pos;

    if (!$target.hasClass('occupied')) {
        pow = Number($target.attr('data')) - 1;
        pos = Math.pow(2, pow);
        if (this.xTurn) {
            $target.addClass('x');
            this.xPos |= pos;
        } else {
            $target.addClass('o');
            this.oPos |= pos;
        }
        $target.addClass('occupied');
        if (!this.checkVictory() && !this.checkDraw()) {
            this.xTurn = !this.xTurn;
            if (this.xTurn === this.botBool) {
                this.bot.play();
            }
        }
    }
};

Board.prototype.checkVictory = function() {
    var checkPos = this.xTurn ? this.xPos : this.oPos,
        i = 0;
    for (; i < WINNING_POS.length; i++) {
        if ((checkPos & WINNING_POS[i]) === WINNING_POS[i]) {
            this.showVictoryAlert();
            return true;
        }
    }
    return false;
};

Board.prototype.showVictoryAlert = function() {
    var winner = this.xTurn ? 'x' : 'o';
    $('.tile').off('click');
    setTimeout(alert, 100, winner + ' wins!');
};

Board.prototype.checkDraw = function() {
    if ($('.tile:not(.occupied)').length === 0) {
        $('.tile').off('click');
        setTimeout(alert, 100, "DRAW!");
        return true;
    }
    return false;
};