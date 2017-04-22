var deck, hand;

window.onload = init;

function init() {

    deck = new Stack();
    hand = new Stack();

    deck.makeDeck(1);
    shuffle();
    deal();
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
