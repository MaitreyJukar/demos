var Bot = function(options) {
    this.me = options.symbol;
    this.opponent = this.me === 'x' ? 'o' : 'x';
};

Bot.prototype.play = function() {
    this.analyze();
    this.think();
};

Bot.prototype.analyze = function() {
    this.myPos = this.getMyPosition();
    this.opponentPos = this.getOpponentPostion();
};

Bot.prototype.think = function() {
    if (!this.centerOccupied()) {
        this.occupyCenter();
    } else if (this.goForVictory()) {
        console.log("WON");
    } else if (this.stopOpponent()) {
        console.log("SAFE");
    } else if (this.makeSmartMove()) {
        console.log("BEST OF LUCK");
    } else {
    	this.justMakeAMark();
    }
};

Bot.prototype.centerOccupied = function() {
    var center = parseInt('000010000', 2);
    return (center & this.myPos) === center || (center & this.opponentPos) === center;
};

Bot.prototype.occupyCenter = function() {
    var center = parseInt('000010000', 2);
    this.placePointAt(center);
};

Bot.prototype.makeOrBreak = function(pos, oppPos) {
    var i = 0,
        situation,
        pointToBePlaced;
    for (; i < WINNING_POS.length; i++) {
        situation = pos & WINNING_POS[i];
        if (this.canWin(situation)) {
            pointToBePlaced = situation ^ WINNING_POS[i];
            if (!(pointToBePlaced & oppPos)) {
                this.placePointAt(pointToBePlaced);
                return true;
            }
        }
    }
    return false;
};

Bot.prototype.goForVictory = function() {
    return this.makeOrBreak(this.myPos, this.opponentPos);
};

Bot.prototype.stopOpponent = function() {
    return this.makeOrBreak(this.opponentPos, this.myPos);
};

Bot.prototype.makeSmartMove = function() {
    var i = 0,
        situation,
        validPos=[];
    for (; i < WINNING_POS.length; i++) {
        situation = this.myPos & WINNING_POS[i];
        if (this.isSmartMove(situation) && (this.opponentPos & WINNING_POS[i]) === 0) {
            validPos.push(situation ^ WINNING_POS[i]);
        }
    }
    if (validPos.length) {
        this.placePointAt(this.findBestPoint(validPos));
        return true;
    }
    return false;
};

Bot.prototype.findBestPoint = function(validPos) {
    var i = 0,
        j = 0,
        posCount = [0, 0, 0, 0, 0, 0, 0, 0, 0],
        allPos = validPos.map(function(val) {
            return val.toString(2).split('').reverse();
        }),
        maxVal = -1,
        maxIdx = -1;
    for (; i < allPos.length; i++) {
        for (j = 0; j < 9; j++) {
            if (allPos[i][j] === "1") {
                posCount[j]++;
            }
        }
    }
    maxVal = Math.max.apply(null, posCount);
    maxIdx = posCount.indexOf(maxVal);
    return Math.pow(2, maxIdx);
};

Bot.prototype.justMakeAMark = function() {
    var validPlaces = ((this.myPos | this.opponentPos) ^ parseInt("11111111", 2)).toString(2).split('').reverse();
    this.placePointAt(Math.pow(2, validPlaces.indexOf("1")));
};

Bot.prototype.getMyPosition = function() {
    return this.generatePosition(this.me);
};

Bot.prototype.getOpponentPostion = function() {
    return this.generatePosition(this.opponent);
};

Bot.prototype.generatePosition = function(cls) {
    var pos = 0,
        pow;
    $('.tile.' + cls).each(function(idx, elem) {
        pow = Number($(elem).attr('data')) - 1;
        pos |= Math.pow(2, pow);
    });
    return pos;
};

Bot.prototype.getBaseLog = function(x, y) {
    return Math.log(y) / Math.log(x);
}

Bot.prototype.placePointAt = function(num) {
    var pos = this.getBaseLog(2, num) + 1;
    this.pointToPlace = pos;
    $('.tile-' + pos).click();
};

Bot.prototype.getPointToPlace = function() {
    this.play();
    return this.pointToPlace;
};

Bot.prototype.canWin = function(situation) {
    return situation.toString(2).split('1').length === 3;
};

Bot.prototype.isSmartMove = function(situation) {
    return situation.toString(2).split('1').length === 2;
};

Bot.prototype.addLeadingZeros = function(num) {
    var n = num.toString(2);
    return "00000000".substr(n.length) + n;
};