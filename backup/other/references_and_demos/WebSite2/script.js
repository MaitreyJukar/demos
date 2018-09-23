$(document).ready(function () {

    var plankXLength,
		plankYLength,
		plankLength,
        possibleSets = [],
        ratios = [],
        trophy = {},
        bagStand = {},
        bookShelf = {},
        ratioSum, currentRatio, smallestPartSizeX, smallestPartSizeY,
        piece1X, piece2X, piece1Y, piece2Y, piece1XY, piece2XY;

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

    for (plankXLength = 3; plankXLength <= 12; plankXLength++) {

		for (plankYLength = 3; plankYLength <= 4; plankYLength++) {
		
			if (plankXLength % plankYLength === 0) {
			
				plankLength = Math.sqrt((plankXLength * plankXLength) + (plankYLength * plankYLength));
		
				for (var i = 0; i < ratios.length; i++) {
					var currentSet = {};
					currentSet.trophyFlag = false;
					currentSet.bagStandFlag = false;
					currentSet.bookShelfFlag = false;
					currentRatio = ratios[i];
					ratioSum = currentRatio.ratioLeft + currentRatio.ratioRight;
					smallestPartSizeX = plankXLength / ratioSum;
					smallestPartSizeY = plankYLength / ratioSum;
		
					if (((smallestPartSizeX * 10 % 1) === 0) && ((smallestPartSizeY * 10 % 1) === 0)) {
		
					    piece1X = (currentRatio.ratioLeft * (smallestPartSizeX * 10)) / 10;
					    piece2X = (currentRatio.ratioRight * (smallestPartSizeX * 10)) / 10;
						
					    piece1Y = (currentRatio.ratioLeft * (smallestPartSizeY * 10)) / 10;
					    piece2Y = (currentRatio.ratioRight * (smallestPartSizeY * 10)) / 10;
		
						piece1XY = Math.sqrt((piece1X * piece1X) + (piece1Y * piece1Y));
						piece2XY = Math.sqrt((piece2X * piece2X) + (piece2Y * piece2Y));
						
						// trophy check
						if (plankLength <= trophy.totalMax && plankLength >= trophy.totalMin) {
		
							if (piece1XY > trophy.part2Min && piece1XY < trophy.part1Max && piece2XY > trophy.part2Min && piece2XY < trophy.part1Max) {
		
							    if (!(piece1XY > 4 && piece1XY < 4.5) || (piece2XY > 4 && piece2XY < 4.5)) {

							        currentSet.trophyFlag = true;
							    }
							}
						}
		
						// bag stand check
						if (plankLength <= bagStand.totalMax && plankLength >= bagStand.totalMin) {
		
							if (piece1XY > bagStand.part1Min && piece1XY < bagStand.part2Max && piece2XY > bagStand.part1Min && piece2XY < bagStand.part2Max) {
		
								currentSet.bagStandFlag = true;
							}
						}
		
						// book shelf check
						if (plankLength <= bookShelf.totalMax && plankLength >= bookShelf.totalMin) {
		
							if (piece1XY > bookShelf.part3Min && piece1XY < bookShelf.part2Max && piece2XY > bookShelf.part3Min && piece2XY < bookShelf.part2Max) {
		
							    if (!(piece1XY > 4 && piece1XY < 4.5) || (piece2XY > 4 && piece2XY < 4.5)) {

							        currentSet.bookShelfFlag = true;
							    }
							}
						}
		
						if (currentSet.trophyFlag || currentSet.bagStandFlag || currentSet.bookShelfFlag) {
		
							currentSet.plankLength = plankLength;
							currentSet.plankXLength = plankXLength;
							currentSet.plankYLength = plankYLength;
							currentSet.ratio = currentRatio;
							currentSet.piece1Length = piece1XY;
							currentSet.piece2Length = piece2XY;
							possibleSets.push(currentSet);
						}
					}
				}
			}
		}
    }

    for (var j = 0; j < possibleSets.length; j++) {

        $document = $('body');
        $document.append('<br><br>LENGTH = ' + possibleSets[j].plankLength);
		$document.append('<br>LENGTH ALONG X = ' + possibleSets[j].plankXLength);
		$document.append('<br>LENGTH ALONG Y = ' + possibleSets[j].plankYLength);
		$document.append('<br>PIECE 1 LENGTH = ' + possibleSets[j].piece1Length);
		$document.append('<br>PIECE 2 LENGTH = ' + possibleSets[j].piece2Length);
        $document.append('<br>RATIO = ' + possibleSets[j].ratio.ratioLeft + ':' + possibleSets[j].ratio.ratioRight);
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
