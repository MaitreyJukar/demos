$(document).ready(function () {

    var plankLength,
        possibleSets = [],
        ratios = [],
        trophy = {},
        bagStand = {},
        bookShelf = {},
        ratioSum, currentRatio, smallestPartSize,
        piece1, piece2;

    ratios = [
        {
            ratioLeft: 1,
            ratioRight: 1
        },
        {
            ratioLeft: 1,
            ratioRight: 2
        },
        {
            ratioLeft: 1,
            ratioRight: 3
        },
        {
            ratioLeft: 2,
            ratioRight: 3
        },
        {
            ratioLeft: 1,
            ratioRight: 4
        },
        {
            ratioLeft: 1,
            ratioRight: 5
        },
        {
            ratioLeft: 3,
            ratioRight: 5
        },
        {
            ratioLeft: 4,
            ratioRight: 5
        },
        {
            ratioLeft: 1,
            ratioRight: 8
        },
        {
            ratioLeft: 3,
            ratioRight: 7
        },
        {
            ratioLeft: 7,
            ratioRight: 8
        },
        {
            ratioLeft: 7,
            ratioRight: 9
        }
    ]

    trophy.totalMin   = 1;
    trophy.totalMax   = 6;
    trophy.part1Count = 1;
    trophy.part2Count = 2;
    trophy.part1Min   = 2.5;
    trophy.part2Min   = 0.5;
    trophy.part1Max   = 4;
    trophy.part2Max   = 2;


    bagStand.totalMin   = 5;
    bagStand.totalMax   = 11.5;
    bagStand.part1Count = 1;
    bagStand.part2Count = 2;
    bagStand.part1Min   = 2.5;
    bagStand.part2Min   = 5;
    bagStand.part1Max   = 4;
    bagStand.part2Max   = 7.5;


    bookShelf.totalMin   = 7;
    bookShelf.totalMax   = 15;
    bookShelf.part1Count = 1;
    bookShelf.part2Count = 2;
    bookShelf.part3Count = 2;
    bookShelf.part1Min   = 4.5;
    bookShelf.part2Min   = 5;
    bookShelf.part3Min   = 3.5;
    bookShelf.part1Max   = 6;
    bookShelf.part2Max   = 7.5;
    bookShelf.part3Max   = 4;

    for (plankLength = 4; plankLength <= 12; plankLength++) {

        for (var i = 0; i < ratios.length; i++) {
            var currentSet = {};
            currentSet.trophyFlag = false;
            currentSet.bagStandFlag = false;
            currentSet.bookShelfFlag = false;
            currentRatio = ratios[i];
            ratioSum = currentRatio.ratioLeft + currentRatio.ratioRight;
            smallestPartSize = plankLength / ratioSum;

            if ((smallestPartSize * 10 % 1) === 0) {

                piece1 = (currentRatio.ratioLeft * (smallestPartSize * 10)) / 10;
                piece2 = (currentRatio.ratioRight * (smallestPartSize * 10)) / 10;

                // trophy check
                if (plankLength <= trophy.totalMax && plankLength >= trophy.totalMin) {

                    if (piece1 > trophy.part2Min && piece1 < trophy.part1Max && piece2 > trophy.part2Min && piece2 < trophy.part1Max) {

                        if (!(piece1 > 4 && piece1 < 4.5) || (piece2 > 4 && piece2 < 4.5)) {

                            currentSet.trophyFlag = true;
                        }
                    }
                }

                // bag stand check
                if (plankLength <= bagStand.totalMax && plankLength >= bagStand.totalMin) {

                    if (piece1 > bagStand.part1Min && piece1 < bagStand.part2Max && piece2 > bagStand.part1Min && piece2 < bagStand.part2Max) {

                        currentSet.bagStandFlag = true;
                    }
                }

                // book shelf check
                if (plankLength <= bookShelf.totalMax && plankLength >= bookShelf.totalMin) {

                    if (piece1 > bookShelf.part3Min && piece1 < bookShelf.part2Max && piece2 > bookShelf.part3Min && piece2 < bookShelf.part2Max) {

                        if (!(piece1 > 4 && piece1 < 4.5) || (piece2 > 4 && piece2 < 4.5)) {

                            currentSet.bookShelfFlag = true;
                        }
                    }
                }

                if (currentSet.trophyFlag || currentSet.bagStandFlag || currentSet.bookShelfFlag) {

                    currentSet.plankLength = plankLength;
                    currentSet.ratio = currentRatio;
                    currentSet.piece1Length = piece1;
                    currentSet.piece2Length = piece2;
                    possibleSets.push(currentSet);
                }
            }
        }
    }

    for (var j = 0; j < possibleSets.length; j++) {

        $document = $('body');
        $document.append('<br><br>LENGTH = ' + possibleSets[j].plankLength);
        $document.append('<br>RATIO = ' + possibleSets[j].ratio.ratioLeft + ':' + possibleSets[j].ratio.ratioRight);
        $document.append('<br>PIECE 1 LENGTH = ' + possibleSets[j].piece1Length);
        $document.append('<br>PIECE 2 LENGTH = ' + possibleSets[j].piece2Length);
        $document.append('<br>POSSIBLE OBJECTS = ');
        if (possibleSets[j].trophyFlag) {

            $document.append('TROPHY ');
        }
        if (possibleSets[j].bagStandFlag) {

            $document.append('BAG STAND ');
        }
        if (possibleSets[j].bookShelfFlag) {

            $document.append('BOOK SHELF ');
        }
    }
});