(function () {
    'use strict';


    MathInteractives.Common.Interactivities.ConicExplorer.Models.ConicPlotter = MathInteractives.Common.Player.Models.BaseInteractive.extend({

        defaults: function () {
            return {
                /**
                * Whether to show bubbles
                * @attribute showBubbles
                * @type Boolean
                * @default true
                */
                showBubbles: true,
                /**
                * Whether to show graph
                * @attribute showGraph
                * @type Bool
                * @default true
                */
                showGraph: true,
                /** 
                * Stores minimum bubble limit
                * @attribute minBubbleLimit
                * @type Number
                * @default 10
                */
                minBubbleLimit: 10,
                /** 
                * Stores maximum bubble limit
                * @attribute maxBubbleLimit
                * @type Number
                * @default 30
                */
                maxBubbleLimit: 30,
                /** 
                * Stores position array for small bubbles.
                * @attribute currentSmallBubblesPosition
                * @type Array
                * @default null
                */
                currentSmallBubblesPosition: null,
                /** 
                * Stores position array for mid-level bubbles.
                * @attribute currentMiddleBubblesPosition
                * @type Array
                * @default null
                */
                currentMiddleBubblesPosition: null,
                /** 
                * Stores position array for large bubbles.
                * @attribute currentLargeBubblesPosition
                * @type Array
                * @default null
                */
                currentLargeBubblesPosition: null,
                /** 
                * Stores bubble group array for small bubbles.
                * @attribute smallBubbleGroup
                * @type Array
                * @default null
                */
                smallBubbleGroup: null,
                /**
                * Stores bubble group array for middle bubbles.
                * @attribute middleBubbleGroup
                * @type Array
                * @default null
                */
                middleBubbleGroup: null,
                /** 
                * Stores bubble group array for large bubbles.
                * @attribute largeBubbleGroup
                * @type Array
                * @default null
                */
                largeBubbleGroup: null,
                /** 
                * Whether to show pop-up on Try Another click.
                * @attribute showPopupOnTryAnother
                * @type Boolean
                * @default false
                */
                showPopupOnTryAnother: false,
                /**
                * Whether to populate bubbles
                * @attribute populateBubble
                * @type Boolean
                * @default true
                */
                populateBubble: true,
                /**
                * Holds the value of no. of bubbles to pop
                * @attribute noOfBubblesToPop
                * @type Number
                * @default 0
                */
                noOfBubblesToPop: 0,
                /** 
                * Holds the value of activity area start point
                * @attribute activityAreaStartPoint
                * @type Object
                * @default xCoordinate= 143 and yCoordinate= 87
                */
                activityAreaStartPoint: {
                    xCoordinate: 143,
                    yCoordinate: 87
                },
                /**
                * Holds the value of activity area end point
                * @attribute activityAreaEndPoint
                * @type Object
                * @default xCoordinate= 915 and yCoordinate= 530
                */
                activityAreaEndPoint: {
                    xCoordinate: 915,
                    yCoordinate: 530
                },
                /**
                * Holds the value of bubble's start point
                * @attribute startPointBubble
                * @type Object
                * @default xCoordinate= 158 and yCoordinate= 102
                */
                startPointBubble: {
                    xCoordinate: 158,
                    yCoordinate: 102
                },
                /** 
                * Holds the value of bubble's end point
                * @attribute endPointBubble
                * @type Object
                * @default xCoordinate=896 and yCoordinate=525
                */
                endPointBubble: {
                    xCoordinate: 896,
                    yCoordinate: 525
                },
                /**
                * Whether to generate new bubbles
                * @attribute generateNewBubbles
                * @type Boolean
                * @default true
                */
                generateNewBubbles: true,
                /**
                * Whether to show the equation
                * @attribute showEquation
                * @type Boolean
                * @default true
                */
                showEquation: true,
                /**
                * Holds the value of dummy bubble path
                * @attribute dummyBubblePath
                * @type Array
                * @default []
                */
                dummyBubblePath: new Array(),
                /**
                * Holds the value of intersecting bubbles array
                * @attribute intersectBubblesArray
                * @type Array
                * @default []
                */
                intersectBubblesArray: new Array(),
                /**
                * Holds the value of shape
                * @attribute shape
                * @type string
                * @default 'conic'
                */
                shape: 'conic',
                /**
                * Holds the value of foci1
                * @attribute foci1
                * @type Object
                * @default null
                */
                foci1: null,
                /**
                * Holds the value of foci2
                * @attribute foci2
                * @type Object
                * @default null
                */
                foci2: null,
                /**
                * Holds the value of center of graph
                * @attribute center
                * @type Object
                * @default null
                */
                center: null,
                /**
                * Holds the value of center of shape
                * @attribute shapeCenter
                * @type Object
                * @default null
                */
                shapeCenter: null,
                /**
                * Holds the value of major axis
                * @attribute majorAxis
                * @type Number
                * @default 60
                */
                majorAxis: 60,
                /**
                * Holds the value of minor axis
                * @attribute minorAxis
                * @type Number
                * @default 30
                */
                minorAxis: 30,
                /**
                * Holds the distance from thumbtack to foci1
                * @attribute tackToFoci1
                * @type Number
                * @default null
                */
                tackToFoci1: null,
                /**
                * Holds the distance from thumbtack to foci2
                * @attribute tackToFoci2
                * @type Number
                * @default null
                */
                tackToFoci2: null,
                /**
                * Holds the value of thumbtack
                * @attribute thumbTack
                * @type Object
                * @default null
                */
                thumbTack: null,
                /**
                * Holds the value of dummyThumbTack
                * @attribute dummyThumbTack
                * @type Object
                * @default null
                */
                //dummyThumbTack:null,

                /**
                * Holds the value of circumferencePath
                * @attribute circumferencePath
                * @type Array
                * @default null
                */
                circumferencePath: null,
                /**
                * Holds the value of previous angle of rotation of thumbtack
                * @attribute prevAngle
                * @type Number
                * @default null
                */
                prevAngle: null,
                /**
                * Holds the value of current point index in circumference path
                * @attribute currentPointIndex
                * @type Number
                * @default null
                */
                currentPointIndex: null,
                /**
                * Holds the value of positionCounter
                * @attribute positionCounter
                * @type Number
                * @default null
                */
                positionCounter: null,
                /**
                * Holds the value of purple string raster
                * @attribute purple
                * @type Object
                * @default null
                */
                purple: null,
                /**
                * Holds the value of red string raster
                * @attribute red
                * @type Object
                * @default null
                */
                red: null,
                /**
                * Holds the value of black string raster
                * @attribute black
                * @type Object
                * @default null
                */
                black: null,
                /**
                * Holds the value of purple string bar
                * @attribute purpleBar
                * @type Object
                * @default null
                */
                purpleBar: null,
                /**
                * Holds the value of redBar
                * @attribute redBar
                * @type Object
                * @default null
                */
                redBar: null,
                /**
                * Holds the value of purpleStringRaster
                * @attribute purpleStringRaster
                * @type Object
                * @default null
                */
                purpleStringRaster: null,
                /**
                * Holds the value of redStringRaster
                * @attribute redStringRaster
                * @type Object
                * @default null
                */
                redStringRaster: null,
                /**
                * Holds the value of blackStringRaster
                * @attribute blackStringRaster
                * @type Object
                * @default null
                */
                blackStringRaster: null,
                /**
                * Holds the value of purpleStringBarRaster
                * @attribute purpleStringBarRaster
                * @type Object
                * @default null
                */
                purpleStringBarRaster: null,
                /**
                * Holds the value of redStringBarRaster
                * @attribute redStringBarRaster
                * @type Object
                * @default null
                */
                redStringBarRaster: null,
                /**
                * Holds the value of distance between each foci & center
                * @attribute fociCenterDist
                * @type Number
                * @default null
                */
                fociCenterDist: null,
                /**
                * Holds the value of distance between two foci
                * @attribute fociDist
                * @type Number
                * @default null
                */
                fociDist: null,
                /**
                * Holds the value of lastIndex in the circumferencepath
                * @attribute lastIndex
                * @type Number
                * @default null
                */
                lastIndex: null,
                /**
                * Whether to restrict movement along circumference
                * @attribute restrictMovementAlongCircumference
                * @type Boolean
                * @default false
                */
                restrictMovementAlongCircumference: false,
                /**
                * Whether foci are movable
                * @attribute isFociMovable
                * @type Boolean
                * @default true
                */
                isFociMovable: true,
                /**
                * Whether center is movable
                * @attribute isCenterMovable
                * @type Boolean
                * @default true
                */
                isCenterMovable: true,
                /**
                * Whether thumbtack is movable
                * @attribute isThumbTackMovable
                * @type Boolean
                * @default true
                */
                isThumbTackMovable: true,

                /**
                * Whether animation has started
                * @attribute animationStarted
                * @type Boolean
                * @default false
                */
                animationStarted: false,
                /**
                * Holds the value of label for lineA
                * @attribute lableA
                * @type Object
                * @default null
                */
                lableA: null,
                /**
                * Holds the value of label for lineB
                * @attribute lableB
                * @type Object
                * @default null
                */
                lableB: null,
                /**
                * Holds the value of lineA
                * @attribute lineA
                * @type Object
                * @default null
                */
                lineA: null,
                /**
                * Holds the value of lineB
                * @attribute lineB
                * @type Object
                * @default null
                */
                lineB: null,
                /**
                * Holds the value of dashedShape
                * @attribute dashedShape
                * @type Object
                * @default null
                */
                dashedShape: null,
                /**
                * Holds the value of deletaXLine
                * @attribute deletaXLine
                * @type Object
                * @default null
                */
                deletaXLine: null,
                /**
                * Holds the value of label for deletaXLine
                * @attribute deletaXLineLabel
                * @type Object
                * @default null
                */
                deletaXLineLabel: null,
                /**
                * Holds the value of deltaYLine
                * @attribute deltaYLine
                * @type Object
                * @default null
                */
                deltaYLine: null,
                /**
                * Holds the value of label for deletaYLine
                * @attribute deletaYLineLabel
                * @type Object
                * @default null
                */
                deletaYLineLabel: null,

                /**
                * Holds the value of snapped X coordinate of shapeCenter
                * @attribute shapeCenterSnapX
                * @type number
                * @default 0
                */

                shapeCenterSnapX: 0,

                /**
                * Holds the value of snapped Y coordinate of shapeCenter
                * @attribute shapeCenterSnapY
                * @type number
                * @default 0
                */

                shapeCenterSnapY: 0,

                /**
                * Holds the value of equationEllipseB
                * @attribute equationEllipseB
                * @type 
                * @default null
                */

                equationEllipseB: null,

                /**
                * Holds the value of equationEllipseA
                * @attribute equationEllipseA
                * @type 
                * @default null
                */

                equationEllipseA: null,

                /**
                * Holds the value of center of ellipse
                * @attribute ellipseCenterCoordinate
                * @type object
                * @default null
                */

                ellipseCenterCoordinate: null,

                /**
                * Holds the value or whether popped bubbles to be shown or not
                * @attribute showPoppedBubbles
                * @type boolean
                * @default false
                */

                showPoppedBubbles: false,

                /**
                * Holds the value of circlePoint
                * @attribute circlePoint
                * @private
                * @type object
                * @default null
                */

                circlePoint: null,

                /**
                * Holds the value of center Coordinate
                * @attribute centerCoordinate
                * @private
                * @type object
                * @default null
                */

                centerCoordinate: null,

                /**
                * Holds the value of projected point on the x axis
                * @attribute circlePointCoordinate
                * @private
                * @type object
                * @default null
                */

                circlePointCoordinate: null,

                /**
                * Holds the value of coordinate of thumbtack
                * @attribute 
                * @private
                * @type object
                * @default null
                */

                thumbTackCoordinate: null,

                /**
                * Holds the value of radiusString
                * @attribute radiusString
                * @private
                * @type object
                * @default null
                */

                radiusString: null,

                /** Stores bubble area center
                * @type object
                * @default null
                */

                bubblesBoundsCenter: null,

                /**
                * Holds the value of circleDeltaX
                * @attribute circleDeltaX
                * @private
                * @type object
                * @default null
                */

                circleDeltaX: null,
                draggingDisabled: false,

                /**
                * Holds the value of circleDeltaY
                * @attribute circleDeltaY
                * @private
                * @type object
                * @default null
                */

                circleDeltaY: null,

                /**
                * Holds the value of readius of circle
                * @attribute circleRadius
                * @private
                * @type number
                * @default null
                */

                circleRadius: null,

                /**
                * Holds the value of group of all bubbles
                * @attribute allBubbleGroup
                * @private
                * @type object
                * @default null
                */

                allBubbleGroup: null,


                /**
                * Holds the solid center circle paper item
                * @attribute shapeCenterCircle
                * @private
                * @type object
                * @default null
                */
                shapeCenterCircle: null,

                /**
                * Holds if it replay animation or not
                * @attribute isReplay
                * @type boolean
                * @default false
                */
                isReplay: false,

                isVertical: false
            }
        },
        /**
        * 
        *
        * @method initialize
        **/
        initialize: function () {
            this.set('dummyBubblePath', []);
            this.set('intersectBubblesArray', []);
        },
        /********************************getter and setter*********************************/

        getMinBubbleLimit: function () {

            return this.get('minBubbleLimit');
        },

        setMinBubbleLimit: function (value) {

            this.set('minBubbleLimit', value);
        },
        getMaxBubbleLimit: function () {

            return this.get('maxBubbleLimit');
        },

        setMaxBubbleLimit: function (value) {

            this.set('maxBubbleLimit', value);
        },

        getShowGraph: function () {
            return this.get('showGraph');

        },
        setShowGraph: function (value) {

            this.set('showGraph', value);
        },


        getShowBubbles: function () {
            return this.get('showBubbles');

        },
        setShowBubbles: function (value) {

            this.set('showBubbles', value);
        },


        getStartPointBubble: function () {


            return this.get('startPointBubble');
        },

        setStartPoint: function (xValue, yValue) {

            var startPoint = this.getStartPointBubble();
            startPoint.xCoordinate = xValue;
            startPoint.yCoordinate = yValue;
        },

        getEndPointBubble: function () {


            return this.get('endPointBubble');
        },


        setEndPoint: function (xValue, yValue) {

            var endPoint = this.getEndPointBubble();
            endPoint.xCoordinate = xValue;
            endPoint.yCoordinate = yValue;
        },

        getSmallerBubbleRadius: function () {

            return this.get('smallerBubbleRadius');
        },

        getMiddleBubbleRadius: function () {

            return this.get('middleBubbleRadius');
        },
        getLargerBubbleRadius: function () {

            return this.get('largerBubbleRadius');
        },


        setSmallerBubbleRadius: function (value) {

            this.set('smallerBubbleRadius', value);
        },

        setLargerBubbleRadius: function (value) {

            this.set('largerBubbleRadius', value);
        },

        setMiddleBubbleRadius: function (value) {

            this.set('middleBubbleRadius', value);
        },

        /**
        * 
        *
        * @method generateRandomNumber
        * @public
        * @param minLimit {{number}} minimum limit
        * @param maxLimit {{number}} maximum limit
        * @return {{number}} random number
        */

        generateRandomNumber: function (minLimit, maxLimit) {
            return Math.floor(Math.random() * (maxLimit - minLimit + 1)) + minLimit;
        },

        /**
        * checks whether the point is in activity area or not
        */
        isPointValid: function _isPointValid(eventPoint/*, foci1, foci2, thumbTack, shapeCenter*/) {
            //            var pointX = point.x,
            //                pointY = point.y,
            //                yLimit = this.get('canvasHeight') - 12,
            //                xLimit = this.get('canvasWidth') - 12,
            //                lowerLimit = 12,
            //                stepSize = this.get('stepSize'),
            //                endPointRadius = this.get('endPointRadius'),
            var isValid = false,
             startPoint = this.get('activityAreaStartPoint'),
                endPoint = this.get('activityAreaEndPoint'),
                foci1 = this.get('foci1').position,
                foci2 = this.get('foci2').position,
               thumbTack = this.get('thumbTack').position,
               shapeCenter = this.get('shapeCenter').position;

            //            if (firstLineInvalid) {
            //                lowerLimit = stepSize - endPointRadius;
            //                //xLimit = xLimit - stepSize + endPointRadius;
            //                xLimit = xLimit + endPointRadius;
            //                yLimit = yLimit - stepSize + endPointRadius;
            //            }

            //            if (pointX < lowerLimit || pointX > xLimit || pointY < lowerLimit || pointY >= yLimit) {
            //                isValid = false;
            //            }

            if ((eventPoint.x > startPoint.xCoordinate) &&
                 (eventPoint.x < endPoint.xCoordinate) &&
                 (eventPoint.y > startPoint.yCoordinate) &&
                 (eventPoint.y < endPoint.yCoordinate) &&

                 (foci1.x > startPoint.xCoordinate) &&
                 (foci1.x < endPoint.xCoordinate) &&
                 (foci1.y > startPoint.yCoordinate) &&
                 (foci1.y < endPoint.yCoordinate) &&

                 (foci2.x > startPoint.xCoordinate) &&
                 (foci2.x < endPoint.xCoordinate) &&
                 (foci2.y > startPoint.yCoordinate) &&
                 (foci2.y < endPoint.yCoordinate) &&

                 (thumbTack.x > startPoint.xCoordinate) &&
                 (thumbTack.x < endPoint.xCoordinate) &&
                 (thumbTack.y > startPoint.yCoordinate) &&
                 (thumbTack.y < endPoint.yCoordinate) &&

                 (shapeCenter.x > startPoint.xCoordinate) &&
                 (shapeCenter.x < endPoint.xCoordinate) &&
                 (shapeCenter.y > startPoint.yCoordinate) &&
                 (shapeCenter.y < endPoint.yCoordinate)
            ) {
                isValid = true;
            }
            return isValid;
        },

        /**
        * Returns the random position array for random anumber between 10 to 30
        * @method setPositionsOfBubbles
        * @return currentPositionArray array of position
        */
        setPositionsOfBubbles: function () {
            var self = this,
                startPointBubble = this.get('startPointBubble'),
                endPointBubble = this.get('endPointBubble'),
                paddingFromEndPoints = 15,
                minXBubbleBound = startPointBubble.xCoordinate + paddingFromEndPoints,
                minYBubbleBound = startPointBubble.yCoordinate + paddingFromEndPoints,
                maxXBubblebound = endPointBubble.xCoordinate - paddingFromEndPoints,
                maxYBubbleBound = endPointBubble.yCoordinate - paddingFromEndPoints,
                bubblesBoundsCenter = this.get('bubblesBoundsCenter'),
                bubblesBoundsCenterX = bubblesBoundsCenter.x,
                bubblesBoundsCenterY = bubblesBoundsCenter.y,
                minBubble = 30, //this.getMinBubbleLimit(),
                maxBubble = 55, //this.getMaxBubbleLimit(),
                currentPositionArray = new Array(),
                currentRandomNumber = null,
                bubblesInEachQuad = null,
                count = null;

            currentRandomNumber = this.generateRandomNumber(minBubble, maxBubble);
            bubblesInEachQuad = Math.ceil(currentRandomNumber / 4);
            for (count = 0; count < bubblesInEachQuad; count++) {
                this.setCurrentArrayValue(currentPositionArray, minXBubbleBound, bubblesBoundsCenterX, minYBubbleBound, bubblesBoundsCenterY);
                this.setCurrentArrayValue(currentPositionArray, bubblesBoundsCenterX, maxXBubblebound, minYBubbleBound, bubblesBoundsCenterY);
                this.setCurrentArrayValue(currentPositionArray, minXBubbleBound, bubblesBoundsCenterX, bubblesBoundsCenterY, maxYBubbleBound);
            }

            if (bubblesInEachQuad * 4 > currentRandomNumber) {
                // manipluation for bubble generation will draw exactly the same bubbles as that of currentRandom Numbers
                bubblesInEachQuad = currentRandomNumber - currentPositionArray.length;
            }

            for (count = 0; count < bubblesInEachQuad; count++) {
                this.setCurrentArrayValue(currentPositionArray, bubblesBoundsCenterX, maxXBubblebound, bubblesBoundsCenterY, maxYBubbleBound);
            }
            return currentPositionArray
        },

        /**
        * set unique number within distance of some specified values
        *
        * @method setCurrentArrayValue
        * @param {array} currentPositionArray to which point is going to be pushed
        * @param {integer} xminbound lower x limit
        * @param {integer} xMaxBound higher x limit
        * @param {integer} yMinBound lower y limit
        * @param {integer} yMaxBound higher y limit      
        **/
        setCurrentArrayValue: function (currentPositionArray, xMinBound, xMaxBound, yMinBound, yMaxBound) {
            var self = this,
                canvasPointX = null,
                canvasPointY = null,
                currentLength = currentPositionArray.length,
                currentDistance = null,
                minDistbtwnPoints = MathInteractives.Common.Components.Models.ExplorerShape.MIN_DIST_TWO_POINTS,
                incrementor = null,
                tempArray = [],
                newPointFlag = null;

            do {
                newPointFlag = false;
                canvasPointX = self.generateRandomNumber(xMinBound, xMaxBound);
                canvasPointY = self.generateRandomNumber(yMinBound, yMaxBound);
                tempArray[0] = canvasPointX;
                tempArray[1] = canvasPointY;

                for (incrementor = 0; incrementor < currentLength; incrementor++) {
                    currentDistance = self.getDistance(tempArray, currentPositionArray[incrementor]);
                    if (currentDistance < minDistbtwnPoints) {
                        newPointFlag = true;
                    }
                }
            } while (newPointFlag)
            currentPositionArray.push(tempArray);
        },

        /**
        * Return the distance between two points
        * @method getDistance
        * @param {integer} point 1 
        * @param {integer} point 2 
        * @return {integer}
        **/
        getDistance: function (point1, point2) {
            var xDiffrenceSquare = Math.pow(Math.abs(point1[0] - point2[0]), 2),
                yDiffrenceSquare = Math.pow(Math.abs(point1[1] - point2[1]), 2);

            return Math.sqrt(xDiffrenceSquare + yDiffrenceSquare);
        },

        /**
        * Add value into dummyBubblePath array.
        * @method setDummyBubblePath
        * @param {Object} currentPath 
        * @public
        */
        setDummyBubblePath: function (currentPath) {
            var currentArray = this.get('dummyBubblePath');
            currentArray.push(currentPath);
        }
    },
    {
        MIN_DIST_TWO_POINTS: 34,
        /**
        * Create explorer shape model for given options
        * @method createExplorerShapeModel
        * @param {object} options
        */
        createExplorerShapeModel: function (options) {
            return new MathInteractives.Common.Components.Models.ExplorerShape(options);
        }
    });
})()