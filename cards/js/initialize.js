document.getElementsByClassName("btn")[0].addEventListener("click", function() {
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

    drawCards();
}

function drawCards() {
    var i=0;

    for (; i < hand.cards.length; i++) {
        drawCard(hand.cards[i], i * 50, 200)
    }
}

function drawCard(card, x, y) {
    var argObj = {
        name: card.suit + card.rank,
        type: Path.PATH_TYPES.IMAGE,
        x: x,
        y: y,
        height: 63,
        width: 44,
        imgData: {
            src: "./img/cards.png",
            x: card.imgPosition.x,
            y: card.imgPosition.y,
            height: 63,
            width: 44
        }
    }


    canvasInstance.drawImage(new Path(argObj));
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

