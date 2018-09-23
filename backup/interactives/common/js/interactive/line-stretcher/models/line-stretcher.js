(function (MathInteractives) {
    'use strict';
    /**
    * Top level model for all tabs
    * @class Line
    * @module LineStretcher
    * @namespace MathInteractives.Interactivities.LineStretcher.Models
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @type Object
    * @constructor
    */
    MathInteractives.Common.Interactivities.LineStretcher.Models.Line = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {
                /**
                * Allow only 1:1 ratio or not
                * 
                * @property allowOnlyMidpoint
                * @type Boolean
                * @default false
                */
                allowOnlyMidpoint: false,

                /**
                * stores height of canvas for grid image
                * 
                * @property canvasHeight
                * @type Object
                * @default 599px
                */
                canvasHeight: 599,

                /**
                *  stores width of canvas for grid image
                * 
                * @property canvasWidth
                * @type Object
                * @default 928px
                */
                canvasWidth: 928
            };
        },

        /**
        * Collection of valid combinations
        * 
        * @property ValidItems
        * @type Object
        */
        ValidItems: null,

        /**
        * Backbone model of each valid combination
        * 
        * @property ValidCombination
        * @type Object
        */
        ValidCombination: null,

        /**
        * Creates collection and calls to create models
        * 
        * @method initialize
        */
        initialize: function () {
            this.ValidItems = new Backbone.Collection;
            this.ValidCombination = Backbone.Model.extend({});
            this._computeValidItemsFromCoordinates();

            this.ValidItems = this.ValidItems.shuffle()
        },

        /**
        * Generates points for combinations
        * 
        * @method _computeValidItemsFromCoordinates
        * @private
        */
        _computeValidItemsFromCoordinates: function () {
            var Model = MathInteractives.Common.Interactivities.LineStretcher.Models.Line,
                dataHorizontal = Model.coordinatesData.horizontal,
                dataVertical = Model.coordinatesData.vertical,
                dataDiagonal = Model.coordinatesData.diagonal,
                onlyMidpoint = false;

            if (this.get('allowOnlyMidpoint')) {
                onlyMidpoint = true;
            }

            for (var i = 0; i < dataHorizontal.length; i++) {
                this._calculateObjects(dataHorizontal[i], 'horizontal', onlyMidpoint);
            }

            for (i = 0; i < dataVertical.length; i++) {
                this._calculateObjects(dataVertical[i], 'vertical', onlyMidpoint);
            }

            for (var i = 0; i < dataDiagonal.length; i++) {
                this._calculateObjects(dataDiagonal[i], 'diagonal', onlyMidpoint);
            }


        },

        /**
        * Determines valid caombinations
        * 
        * @method _calculateObjects
        * @private
        */
        _calculateObjects: function (coordinates, plankType, onlyMidpoint) {
            var Model = MathInteractives.Common.Interactivities.LineStretcher.Models.Line,
                ratios = Model.ratios,
                possibleObjects, model,
                startPoint = coordinates.startPoint,
                endPoint = coordinates.endPoint,
                partLengths, ratioSum, currentRatio, smallestPartSize,
                plankLength = parseFloat(this.getDistance({ x: startPoint[0], y: startPoint[1] }, { x: endPoint[0], y: endPoint[1] }).toFixed(1));

            if (onlyMidpoint) {
                ratios = [[1, 1]];
            }

            for (var i = 0; i < ratios.length; i++) {
                currentRatio = ratios[i];
                ratioSum = currentRatio[0] + currentRatio[1];
                smallestPartSize = plankLength / ratioSum;

                if (plankType === 'diagonal' || ((plankType === 'horizontal' || plankType === 'vertical') && (smallestPartSize * 10 % 1) === 0)) {
                    partLengths = this._getSectionsLength(plankType, currentRatio, smallestPartSize);
                    possibleObjects = this._checkPossibleObjects(parseFloat(partLengths.piece1.toFixed(1)), parseFloat(partLengths.piece2.toFixed(1)), plankType);
                    if (possibleObjects.length > 0) {
                        var objectProps = {};
                        objectProps.type = plankType;
                        objectProps.plankLength = plankLength;
                        objectProps.ratio = currentRatio;
                        objectProps.coordinates = coordinates;

                        objectProps.answers = this._calculateCorrectAnswers(currentRatio, { x: startPoint[0], y: startPoint[1] }, { x: endPoint[0], y: endPoint[1] });

                        if (!(this._checkOneDecimalPrecision(objectProps.answers))) {
                            continue;
                        }

                        if (currentRatio[0] === currentRatio[1]) {
                            objectProps.isMidPoint = true;
                        }
                        else {
                            objectProps.isMidPoint = false;
                        }
                        objectProps.segments = [parseFloat(partLengths.piece1.toFixed(1)), parseFloat(partLengths.piece2.toFixed(1))];
                        objectProps.possibleObjects = possibleObjects;
                        model = new this.ValidCombination(objectProps);
                        this.ValidItems.add(model);
                    }
                }
            }
        },

        /**
        * Calculates points using section formula
        * 
        * @method _calculateCorrectAnswers
        * @param {Object} Array [Nr, Dr]
        * @param {Object} {x:value, y:value}
        * @param {Object} {x:value, y:value}
        * @return {Array} Array of two points that can be answer 
        * @private
        */
        _calculateCorrectAnswers: function (ratio, startPoint, endPoint) {
            var ratioNum = ratio[0],
                ratioDen = ratio[1],
                ratioSum = ratioNum + ratioDen, answers = [],
                answer1 = [], answer2 = [];

            startPoint.x = startPoint.x * 10;
            startPoint.y = startPoint.y * 10;

            endPoint.x = endPoint.x * 10;
            endPoint.y = endPoint.y * 10;

            answer1[0] = (((ratioNum * endPoint.x) + (ratioDen * startPoint.x)) / ratioSum) / 10;
            answer1[1] = (((ratioNum * endPoint.y) + (ratioDen * startPoint.y)) / ratioSum) / 10;

            if (ratioDen !== ratioNum) {
                answer2[0] = (((ratioNum * startPoint.x) + (ratioDen * endPoint.x)) / ratioSum) / 10;
                answer2[1] = (((ratioNum * startPoint.y) + (ratioDen * endPoint.y)) / ratioSum) / 10;
            }
            else {
                answer2 = answer1;
            }

            answers.push(answer1);
            answers.push(answer2);

            return answers;
        },

        /*
        * Returns size of both pieces
        * @method _getSectionsLength
        * @param type {String} horizontal vertical or diagonal
        * @param currentRatio {Array} ratio in which the plank is to be divided
        * @param smallestPartSize1 {Number} if type is diagonal, smallest part size along X, else smallest part size
        * @param smallestPartSize2 {Number} only if type is diagonal. Smallest part size along Y
        * @return {Object} values of sections. If type is diagonal, length of sections along X, Y and diagonal
        */
        _getSectionsLength: function (type, currentRatio, smallestPartSize1) {
            var sectionObject = {},
                ratioNumerator = currentRatio[0],
                ratioDenominator = currentRatio[1];

            sectionObject.piece1 = (ratioNumerator * (smallestPartSize1 * 10)) / 10;
            sectionObject.piece2 = (ratioDenominator * (smallestPartSize1 * 10)) / 10;

            return sectionObject;
        },

        /*
        * Returns possible objects that can be formed
        * @method _checkPossibleObjects
        * @param part1Length {Number} Length of one piece. Must be an integer
        * @param part2Length {Number} Length of other piece. Must be an integer
        * @return {Object} Contains flags of each object that can be formed: trophyFlag, bagFlag, bookFlag
        */
        _checkPossibleObjects: function (part1Length, part2Length, type) {
            var totalLength = part1Length + part2Length,
                Model = MathInteractives.Common.Interactivities.LineStretcher.Models.Line,
                currentArray = [],
                currentSet = {
                    'trophyFlag': false,
                    'bagFlag': false,
                    'bookFlag': false
                };

            if ((part1Length <= 1 || part2Length <= 1) && type === 'horizontal') {
                return currentArray;
            }

            if (totalLength <= Model.trophyValues.totalMax && totalLength >= Model.trophyValues.totalMin) {

                if (part1Length >= Model.trophyValues.partMin && part1Length <= Model.trophyValues.partMax
                && part2Length >= Model.trophyValues.partMin && part2Length <= Model.trophyValues.partMax) {

                    if (!((part1Length > Model.trophyValues.emptyZoneMin && part1Length < Model.trophyValues.emptyZoneMax)
                    || (part2Length > Model.trophyValues.emptyZoneMin && part2Length < Model.trophyValues.emptyZoneMax))) {

                        if (!(part1Length > Model.trophyValues.parts[1].maxLength && part2Length > Model.trophyValues.parts[1].maxLength)) {

                            currentSet.trophyFlag = true;
                            currentArray.push(Model.objectsToForm[1]);
                        }
                    }
                }
            }

            if (totalLength <= Model.bagStandValues.totalMax && totalLength >= Model.bagStandValues.totalMin) {

                if (part1Length >= Model.bagStandValues.partMin && part1Length <= Model.bagStandValues.partMax
                && part2Length >= Model.bagStandValues.partMin && part2Length <= Model.bagStandValues.partMax) {

                    if (!((part1Length > Model.bagStandValues.emptyZoneMin && part1Length < Model.bagStandValues.emptyZoneMax)
                    || (part2Length > Model.bagStandValues.emptyZoneMin && part2Length < Model.bagStandValues.emptyZoneMax))) {

                        if (!(part1Length > Model.bagStandValues.parts[0].maxLength && part2Length > Model.bagStandValues.parts[0].maxLength)) {

                            currentSet.bagFlag = true;
                            currentArray.push(Model.objectsToForm[3]);
                        }
                    }
                }
            }

            if (totalLength <= Model.bookShelfValues.totalMax && totalLength >= Model.bookShelfValues.totalMin) {

                if (part1Length >= Model.bookShelfValues.partMin && part1Length <= Model.bookShelfValues.partMax
                && part2Length >= Model.bookShelfValues.partMin && part2Length <= Model.bookShelfValues.partMax) {

                    if (!((part1Length > Model.bookShelfValues.emptyZoneMin && part1Length < Model.bookShelfValues.emptyZoneMax)
                    || (part2Length > Model.bookShelfValues.emptyZoneMin && part2Length < Model.bookShelfValues.emptyZoneMax))) {

                        if (!(part1Length > Model.bookShelfValues.parts[2].maxLength
                        && part1Length < Model.bookShelfValues.parts[1].minLength
                        && part2Length > Model.bookShelfValues.parts[2].maxLength && part2Length < Model.bookShelfValues.parts[1].minLength)) {

                            if (part2Length > 5 || part2Length < 4.5) {
                                currentSet.bookFlag = true;
                                currentArray.push(Model.objectsToForm[2]);
                            }
                        }
                    }
                }
            }

            return currentArray;
        },
        /**
        * Checks whether the answers are upto 1 precision
        * 
        * @method _checkOneDecimalPrecision
        * @param {Array} Array of answers
        * @return {Boolean} Returns true if all values are upto 1 precision
        */
        _checkOneDecimalPrecision: function (answers) {
            var regex = new RegExp('^[0-9]{0,2}\\.[0-9]?$|^[0-9]{0,2}$');
            return (regex.test(answers[0][0]) && regex.test(answers[0][1]) && regex.test(answers[1][0]) && regex.test(answers[1][1]));
        },

        //------------------------------ Public functions --------------------------------

        /**
        * Calculates distance be two points
        * 
        * @method getDistance
        * @param {Object} {x:value, y:value}
        * @param {Object} {x:value, y:value}
        * @return {Number} Value of distance
        */
        getDistance: function (point1, point2) {
            var xDiff = point1.x - point2.x,
                yDiff = point1.y - point2.y,
                distance = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));

            return distance;
        },

        /*
        * Returns a random integer between min and max
        * @method _getRandomInt
        * @param min {Number} Minimum value allowed
        * @param max {Number} Maximum value allowed
        */
        getRandomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        /**
        * Checks if a point lies in between given two points
        * 
        * @method liesOnPlank
        * @param {Object} {x:value, y:value}
        * @param {Object} {x:value, y:value}
        * @param {Object} {x:value, y:value}
        * @return {Boolean} 
        */
        liesOnPlank: function (point1, point2, point, type) {
            var liesOnPlank = false, isAllowed = true,
                minX, maxX, minY, maxY;

            if (point1.x > point2.x) {
                minX = point2.x;
                maxX = point1.x;
            }
            else {
                minX = point1.x;
                maxX = point2.x;
            }

            if (point1.y > point2.y) {
                minY = point2.y;
                maxY = point1.y;
            }
            else {
                minY = point1.y;
                maxY = point2.y;
            }

            // Check if point lies between point1 and point2
            if ((point.x >= minX && point.x <= maxX) && (point.y >= minY && point.y <= maxY)) {
                liesOnPlank = true;
            }

            if (liesOnPlank && type === 'diagonal') {
                point.x = point.x * 10;
                point.y = point.y * 10;

                point1.x = point1.x * 10;
                point1.y = point1.y * 10;

                point2.x = point2.x * 10;
                point2.y = point2.y * 10;

                // Check if point lies on the diagonal plank
                var slope1 = (point.y - point1.y) / (point.x - point1.x),
                    slope2 = (point2.y - point.y) / (point2.x - point.x);

                if (Math.abs(slope1 - slope2) > 0.07) {
                    liesOnPlank = false;
                }
                else {
                    var dist1 = this.getDistance(point, point1),
                        dist2 = this.getDistance(point, point2);

                    // Check if the point is lying above bricks
                    if (dist1 / 10 < 0.7 || dist2 / 10 < 0.7) {
                        isAllowed = false;
                    }
                }
            }

            return {
                liesOnPlank: liesOnPlank,
                isAllowed: isAllowed
            };
        },

        /**
        * Finds lengths of two sections
        * 
        * @method getSectionLengths
        * @param {Object} {x:value, y:value}
        * @param {Object} {x:value, y:value}
        * @param {Object} {x:value, y:value}
        * @return {Array} Lengths of both sections
        */
        getSectionLengths: function (startPoint, endPoint, chopPoint) {
            var plankLength = parseFloat(this.getDistance(startPoint, endPoint).toFixed(4)),
                firstSectionLength = parseFloat(this.getDistance(startPoint, chopPoint).toFixed(4)),
                secondSectionLength = parseFloat(this.getDistance(chopPoint, endPoint).toFixed(4));

            return [firstSectionLength, secondSectionLength];
        },

        /**
        * Finds lowest form of fraction
        * 
        * @method getLengthsRatio
        * @param {Number} Numerator 
        * @param {Number} Denominator
        * @return {Array} Reduced fraction
        */
        getLengthsRatio: function (numerator, denominator) {
            var gcd = function gcd(a, b) {
                return b ? gcd(b, a % b) : a;
            };
            gcd = gcd(numerator, denominator);

            return [numerator / gcd, denominator / gcd];
        }


    }, {

        color: {
            white: '#ffffff',
            black: '#000000',
            inputBoxBorderColor: '#888888',
            plankBorder: '#624A1D',
            axis: '#2d2d2d',
            answer: '#ff000c',
            plankEndpoint: '#624A1D',
            red: '#ff000c',
            green: '#248000',
            feedBackLine: '#624a1d',
            brickColor: '3e3e3e'
        },

        Points: {
            xAxisStartPoints: [40, 587],
            xAxisEndPoints: [886, 587], // x:(42*20)+44 = 884
            yAxisStartPoints: [42, 587],
            yAxisEndPoints: [42, 124], // y:3*42 + 2 = 126
            xAxisCenterPoints: [464, 587],
            yAxisCenterPoints: [46, 331],
            xAxisArrowCenterPoints: [892, 587],
            yAxisArrowCenterPoints: [42, 119],
            axisTriangleHeight: 12,
            axisTriangleWidth: 10
        },

        strokeWidth: {
            axisStrokeWidth: 4,
            displayAnswerStrokeWidth: 2
        },

        ratios: [
            [1, 1],
            [1, 2],
            [1, 3],
            [2, 3],

            [1, 4],
            [1, 5],
            [3, 5],
            [4, 5],

            [1, 8],
            [7, 8],
            [7, 9],

            [3, 7]
        ],

        objectsToForm: {
            1: 'trophy-stand',
            2: 'book-shelf',
            3: 'bag-stand'
        },

        validDataSet: [],

        coordinatesData: {
            horizontal: [
                {
                    startPoint: [4, 5],
                    endPoint: [10, 5]
                },
                {
                    startPoint: [3, 6],
                    endPoint: [10, 6]
                },
                {
                    startPoint: [3, 5],
                    endPoint: [11, 5]
                },
                {
                    startPoint: [2, 6],
                    endPoint: [11, 6]
                },
                {
                    startPoint: [5, 5],
                    endPoint: [9, 5]
                }
            ],

            vertical: [
                {
                    startPoint: [10, 2],
                    endPoint: [10, 9]
                },
                {
                    startPoint: [11, 2],
                    endPoint: [11, 8]
                },
                {
                    startPoint: [10, 4],
                    endPoint: [10, 8]
                },
                {
                    startPoint: [9, 3],
                    endPoint: [9, 9]
                },
                {
                    startPoint: [8, 2],
                    endPoint: [8, 6]
                }
            ],

            diagonal: [
                {
                    startPoint: [3, 4.5],
                    endPoint: [7, 6.5]
                },
                {
                    startPoint: [5, 5.5],
                    endPoint: [9, 6.5]
                },
                {
                    startPoint: [5, 4],
                    endPoint: [9.5, 5.5]
                },
                {
                    startPoint: [4, 5],
                    endPoint: [9, 6]
                },
                {
                    startPoint: [4, 4.5],
                    endPoint: [10, 6.5]
                },
                {
                    startPoint: [4, 4.5],
                    endPoint: [10, 6]
                },
                {
                    startPoint: [3, 6.5],
                    endPoint: [7, 4.5]
                },
                {
                    startPoint: [5, 6.5],
                    endPoint: [9, 5.5]
                },
                {
                    startPoint: [5, 5.5],
                    endPoint: [9.5, 4]
                },
                {
                    startPoint: [4, 6],
                    endPoint: [9, 5]
                },
                {
                    startPoint: [4, 6.5],
                    endPoint: [10, 4.5]
                },
                {
                    startPoint: [4, 6],
                    endPoint: [10, 4.5]
                }
            ]
        },

        trophyValues: {
            'totalMin': 1,
            'totalMax': 6,
            'partMin': 0.5,
            'partMax': 4,
            'emptyZoneMin': 2,
            'emptyZoneMax': 2.5,
            'parts': [
                {
                    'count': 1,
                    'minLength': 2.5,
                    'maxLength': 4
                },
                {
                    'count': 2,
                    'minLength': 0.5,
                    'maxLength': 2
                }
            ]
        },

        bagStandValues: {
            'totalMin': 5,
            'totalMax': 11.5,
            'partMin': 2.5,
            'partMax': 7.5,
            'emptyZoneMin': 4,
            'emptyZoneMax': 5,
            'parts': [
                {
                    'count': 2,
                    'minLength': 2.5,
                    'maxLength': 4
                },
                {
                    'count': 1,
                    'minLength': 5,
                    'maxLength': 7.5
                }
            ]
        },

        bookShelfValues: {
            'totalMin': 7,
            'totalMax': 15,
            'partMin': 3.5,
            'partMax': 7.5,
            'emptyZoneMin': 4,
            'emptyZoneMax': 4.5,
            'parts': [
                {
                    'count': 1,
                    'minLength': 4.5,
                    'maxLength': 6
                },
                {
                    'count': 2,
                    'minLength': 5,
                    'maxLength': 7.5
                },
                {
                    'count': 2,
                    'minLength': 3.5,
                    'maxLength': 4
                }
            ]
        },
        punchingBagCoOrdinates: [14, 42],

        xAxisOffset: 1,

        yAxisOffset: 14,

        tickLength: 25,

        plankOpacity: 1,
        plankOpacityDivident: 2,
        plankFadeOutInterval: 50,
        rotationStartAngle: 80,
        rotationAngleDecerementor: 4,

        trophyCoOrdinates: [27, 55],

        plankWidth: 16,

        gridSize: 42,

        brickCornerRadius: 3,

        horizontalBrickHeight: 22.25,

        horizontalBrickWidth: 42,

        diagonalBrickHeight: 21,

        diagonalBrickWidth: 42,

        verticalDirection: 'vertical',

        horizontalDirection: 'horizontal',

        containerHeightOffset: 96,

        containerTopOffset: 70,

        horizontalRodneyTopOffset: 203,

        rodneyImageHeight: 300,

        rodneyImageWidth: 291,

        objectContainerXMidPoint: 736,
        horizontalBrickCountEachSide: 4,

        diagonalFixedBricks: 3,

        horizontalBarAnimData: {
            chopOffset: 86,
            frameDuration: 300,
            minDistanceForSlide: 1,
            fadeDuration: 300
        },

        verticalAnimData: {
            rodneyEffectiveHeight: 300,
            kickLowMin: 14,
            kickLowMax: 194,
            kickMidMax: 204,
            kickMidWithJumpMax: 248,
            frameDuration: 300
        }



    });
})(window.MathInteractives);
