function() {
    'use strict';
    document.getElementsByClassName("btn").addEventListener("click", function() {
        hand.orderBySuit();
    });
    var deck, hand, canvasInstance;

    window.onload = init;

    function init() {
        setupCanvas();
        deck = new Stack();
        hand = new Stack();

        deck.makeDeck(1);
        shuffle();
        deal();
    }

    function setupCanvas() {
        var canvas = document.getElementById('card-game');
        canvasInstance = new Canvas({
            "canvas": canvas,
            "ctx": canvas.getContext("2d"),
            "height": canvas.height,
            "width": canvas.width
        });
    }

    function shuffle() {

        if (deck == null) return;

        deck.shuffle(1);
    }

    function deal() {

        var i;

        if (deck == null) {
            return;
        }

        if (deck.cardCount() < 13) {
            alert("Not enough cards.");
        } else {
            for (i = 0; i < 13; i++) {
                hand.addCard(deck.deal());
            }
        }
    }
}();
