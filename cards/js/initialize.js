document.getElementsByClassName("btn")[0].addEventListener("click", function() {
    //canvasInstance.removeAllPaths();
    hand.orderBySuit();
    //canvasInstance.clearCanvas();
    sortCards(true);
});
var deck, hand, canvasInstance, cardSprite;

window.onload = init;

function init() {
    setupCanvas();
    deck = new Stack();
    hand = new Stack();

    deck.makeDeck(1);
    shuffle();
    deal();
    preloadCardImage();
}

function sortCards(sorted) {
    var i = 0,
        prevSuit = "",
        step = 0,
        path;
    for (; i < hand.cards.length; i++) {

        if (sorted && prevSuit !== hand.cards[i].suit) {
            step += 50;
            prevSuit = hand.cards[i].suit;
        }
        path = canvasInstance.getPath(hand.cards[i].suit + hand.cards[i].rank)
        path.x = i * 20 + step;

        path.y = 200;
        canvasInstance.bringToTop(path);

    }
    canvasInstance.draw();
}

function drawCards(sorted) {
    var i = 0;

    for (; i < hand.cards.length; i++) {

        drawCard(hand.cards[i], i * 20, 200)

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
            src: cardSprite,
            x: card.imgPosition.x,
            y: card.imgPosition.y,
            height: 63,
            width: 44
        }
    }


    canvasInstance.addImage(new Path(argObj));
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

function preloadCardImage() {
    cardSprite = new Image();
    cardSprite.onload = function() {
        drawCards();
        canvasInstance.draw();
    };
    cardSprite.src = "./img/cards.png";
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
