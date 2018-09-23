(function () {
    'use strict';
    /**
    * Properties required for Picture Perfect
    *
    * @class 
    * @construtor
    * @extends Backbone.Model
    * @namespace MathInteractives.Interactivities.PicturePerfect.Models
    */
    MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads = MathInteractives.Common.Player.Models.BaseInteractive.extend({
        defaults: {

            /**
            * Stores the current tab
            *
            * @attribute currentTab
            * @type Integer
            * @default 0
            */
            currentTab: 0,

            /**
            * Path displayed (Rectangle shaped or Z shaped).
            *
            * @attribute pathDisplayed
            * @type Integer
            * @default 1
            */
            pathDisplayed: 1,

            /**
            * Collection of pieces csacreated when meteor hits the road
            *
            * @attribute shapeCollection
            * @type Backbone.Collection
            * @default null
            */
            shapeCollection: null,

            /**
            * Stores a boolean whether animation is complete
            *
            * @attribute animationComplete
            * @type Boolean
            * @default false
            */
            animationComplete: false,

            /**
            * Stores a boolean whether road is complete
            *
            * @attribute roadComplete
            * @type Boolean
            * @default false
            */
            roadComplete: false,

            /**
            * Stores a boolean whether activity is complete
            *
            * @attribute activityComplete
            * @type Boolean
            * @default false
            */
            activityComplete: false,

            /**
            * Stores a boolean whether wrong activity is complete
            *
            * @attribute wrongActivityComplete
            * @type Boolean
            * @default false
            */
            wrongActivityComplete:false,

            /**
            * Store the current cursor type.
            *
            * @attribute cursor
            * @type MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.CURSOR_TYPE
            * @default MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.CURSOR_TYPE.DEFAULT
            */
            cursor: 0,

            /**
            * Co-ordinates to generate the entire z-path paper object
            *
            * @attribute zPathCoordinates
            * @type Object
            * @default null
            */
            zPathCoordinates: null,

            /**
            * Co-ordinates to generate the entire rect-path paper object
            *
            * @attribute rectPathCoordinates
            * @type Object
            * @default null
            */
            rectPathCoordinates: null,

            /**
            * Whether to check path snap or not
            *
            * @attribute checkPathSnap
            * @type Boolean
            * @default true
            */
            checkPathSnap: true,

            /**
            * To check if snapped horizontally
            *
            * @attribute snappedToX
            * @type Boolean
            * @default false
            */
            snappedToX: false,


            /**
            * To check if snapped vertically
            *
            * @attribute snappedToY
            * @type Boolean
            * @default false
            */
            snappedToY: false,

            /**
            * To check if snapped to path
            *
            * @attribute snappedToPath
            * @type Boolean
            * @default false
            */
            snappedToPath: false,

            /**
            * To check if wrong path snapped horizontally
            *
            * @attribute snappedToWrongX
            * @type Boolean
            * @default false
            */
            snappedToWrongX: false,


            /**
            * To check if wrong path snapped vertically
            *
            * @attribute snappedToWrongY
            * @type Boolean
            * @default false
            */
            snappedToWrongY: false,

            /**
            * To check if snapped to wrong path
            *
            * @attribute snappedToWrongPath
            * @type Boolean
            * @default false
            */
            snappedToWrongPath: false,


            /**
            * Number of angles of each type
            *
            * @attribute numberOfAngles
            * @type Object
            * @default {}
            */
            numberOfAngles: {},

            /**
            * Angle to be Read for accessibility
            *
            * @attribute anglesToBeRead
            * @type Object
            * @default {}
            */
            anglesToBeRead: {},

            /**
            * Stored Shape Order
            *
            * @attribute orderOfShapeGroups
            * @type Array
            * @default []
            */
            orderOfShapeGroups: [],

            /**
            * Stores paper object of shape group
            *
            * @attribute numberOfShapeGroupChildren
            * @type Object
            * @default {}
            */
            numberOfShapeGroupChildren: {},

            /**
            * Stores paper object of last selected shape
            *
            * @attribute lastSelectedShapeGroup
            * @type Object
            * @default null
            */
            lastSelectedShapeGroup: null,

            /**
            * Stores array of help screen elements.
            *
            * @property helpElements
            * @type {string}
            * @default null
            */
            helpElements: null

        },

        /**
        * Initializes the model properties.
        *
        * @method initialize
        * @constructor
        */
        initialize: function () {
            var shapeCollection = this.get('shapeCollection');

            if (shapeCollection === null) {
                this.initializeShapeCollection();
            }
            else {
                this._createShapeCollectionFromJson(shapeCollection);
            }
            this.generatePathCoordinates();
            this.set('helpElements', []);
        },

        /**
        * Get the current state data in json
        *
        * @method getCurrentStateData
        */
        getCurrentStateData: function () {
            var result = JSON.stringify(this, this.getJSONAttributes);
            return result;
        },

        /**
        * Get the json attributes for each key
        *
        * @method getJSONAttributes
        * @param key{String} key of json
        * @param value{String} x2 value of json
        * @private
        */
        getJSONAttributes: function (key, value) {

            var result = value;

            switch (key) {
                case 'path':
                case 'manager':
                case 'player':
                case 'jsonData':
                case 'helpElements':
                    result = undefined;
                    break;
            }

            return result;
        },

        /**
        * Initialize the pieces collection.
        *
        * @method initializePieceCollection
        * @private
        */
        initializeShapeCollection: function () {
            var pathDisplayed = this.get('pathDisplayed');
            var currentNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;

            if (pathDisplayed === currentNamespace.ROADTYPES.RECTANGLESHAPED) {
                this._generateRectRoadShapes();
            }
            else {
                this._generateZRoadShapes();
            }
        },

        /**
        * Create the collection from json
        *
        * @method _createShapeCollectionFromJson
        * @private
        */
        _createShapeCollectionFromJson: function (shapeCollection) {
            var collection = new MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.ShapeCollection(shapeCollection);
            this.set('shapeCollection', collection);
        },

        /**
        * Adding two points at the end of shapes array.
        *
        * @method _addIntoShape
        * @param x1{Number} x1 coordinate
        * @param y1{Number} x2 coordinate
        * @param x2{Number} x2 coordinate
        * @param y2{Number} y2 coordinate
        * @param shapes{Array} Array of shape
        * @private
        */
        _addIntoShape: function (x1, y1, x2, y2, shapes) {

            var point1 = { x: x1, y: y1 };
            var point2 = { x: x2, y: y2 };
            var line = [];
            line.push(point1);
            line.push(point2);

            shapes[shapes.length] = line;
        },

        /**
        * Generating random number between two number
        *
        * @method _generateNumber
        * @param min{Number} Minimum number
        * @param max{Number} Maximum number
        * @private
        */
        _generateNumber: function (min, max) {
            var adjust = max - min + 1;
            return Math.floor(Math.random() * adjust) + min;
        },

        /**
        * Getting length of base if given angle and length of perpendicular in right angled triangle
        *
        * @method _generateNumber
        * @param angle{Number} Theta angle
        * @param perpendicular{Number} Length of perpendicular
        * @private
        */
        _getBaseLength: function (angle, perpendicular) {
            return (Math.tan((Math.abs(angle) * Math.PI) / 180) * perpendicular);
        },

        /**
        * Getting all angles of shape
        *
        * @method _getAngles
        * @param shape{Object} Shape containing points of vertices
        * @private
        */
        _getAngles: function (shape) {
            var length = shape.length, angles = [];
            var loopLen = length;
            if (length > 4) {
                loopLen = 4;
            }

            for (var i = 0; i < loopLen; i++) {
                var A = shape[i - 1 < 0 ? length - 1 : i - 1],
                    B = shape[i],
                    C = shape[(i + 1) % length];
                angles[i] = this._findAngle(A, B, C, true);
            }
            return angles;
        },

        /**
        * Find angle between three points
        *
        * @method _findAngle
        * @param A{Object} First point
        * @param B{Object} Second point
        * @param C{Object} Third point
        * @param degrees{Bool} true if angle required in degree and false if required in radians
        * @private
        */
        _findAngle: function (A, B, C, degrees) {
            var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
            var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
            var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
            if (degrees) {
                return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180 / Math.PI;
            }
            return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
        },

        /**
        * Check whether given point is any vertex of given shape or not.
        *
        * @method _isPointInShape
        * @param point{object} Point contains x and y coordinate
        * @param shape{object} Shape contains array of all vertex(points)
        * @private
        */
        _isPointInShape: function (point, shape) {
            var x = point.x, y = point.y;

            for (var i in shape) {
                i = parseInt(i);
                var x1 = shape[i].x, y1 = shape[i].y;
                if (x === x1 && y === y1) {
                    return true;
                }
            }
            return false;
        },

        /**
        * Generating snap segmets for all the shapes
        *
        * @method _isPointInShape
        * @param shapes{object} Shape contains array of all vertex(points)
        * @param arrSnapPoints{object} To store the snape segments for each shape
        * @private
        */
        _generateSnapeSegments: function (shapes, arrSnapPoints) {

            var point, index;
            var length = shapes.length;

            for (var i = 0; i < length; i++) {
                var shape = shapes[i];

                var next = (i + 1) % length, prev = (i - 1) < 0 ? length - 1 : i - 1;
                var nextShape = shapes[next];
                var prevShape = shapes[prev];
                var nextShapeSnapPoints = [], prevShapeSnapPoints = [];

                for (var j in shape) {
                    point = shape[j];
                    if (this._isPointInShape(point, nextShape)) {
                        nextShapeSnapPoints.push(j);
                    }
                    if (this._isPointInShape(point, prevShape)) {
                        prevShapeSnapPoints.push(j);
                    }
                }

                // For quadrilaterals, reverse the snape point array to match exact points as of the previous shape.
                if (shape.length >= 4) {
                    nextShapeSnapPoints = nextShapeSnapPoints.reverse();
                }
                var snapPoints = {};
                if (nextShapeSnapPoints.length > 0) {
                    snapPoints["shape" + (next + 1)] = nextShapeSnapPoints;
                }
                if (prevShapeSnapPoints.length > 0) {
                    snapPoints["shape" + (prev + 1)] = prevShapeSnapPoints;
                }
                //arrSnapPoints["shape" + (i + 1)] = snapPoints;
                arrSnapPoints[i] = snapPoints;
            }
        },

        /**
        * Generate the pieces of the rectangular shaped road.
        *
        * @method _generateRectRoadShapes
        * @private
        */
        _generateRectRoadShapes: function () {
            var currentNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;

            var outerLeft = currentNamespace.RECTROAD_OFFSET.LEFT;
            var outerTop = currentNamespace.RECTROAD_OFFSET.TOP;
            var outerWidth = currentNamespace.OUTERROADWIDTH;
            var outerHeight = currentNamespace.OUTERROADHEIGHT;
            var outerRight = outerLeft + outerWidth;
            var outerBottom = outerTop + outerHeight;

            var innerWidth = currentNamespace.INNERROADWIDTH;
            var innerHeight = currentNamespace.INNERROADHEIGHT;
            var innerLeft = outerLeft + (outerWidth - innerWidth) / 2;
            var innerTop = outerTop + (outerHeight - innerHeight) / 2;
            var innerRight = innerLeft + innerWidth;
            var innerBottom = innerTop + innerHeight;

            var rectRoadShapes = [];
            var rectRoadSnapSegments = {};

            // To store the generated random numbers for keeping track that no number is repeated.
            var randomDistArray = [],
                randomAngleArray = [];

            // Break the top and bottom pieces of the rectangular road.
            for (var count = 0; count < 2; count++) {
                var innerY, outerY;
                if (count === 0) {
                    // For breaking top pieces
                    innerY = innerTop;
                    outerY = outerTop;
                }
                else {
                    // For breaking bottom pieces
                    innerY = innerBottom;
                    outerY = outerBottom;
                }

                var randomDist = 15,
                    initialDist = 30,
                    horizontalMidDist = 124;

                var innerX = innerLeft + initialDist;

                // Generate unique random number that never comes before.
                var randomNum = this._generateNumber(0, randomDist);
                while (randomDistArray.indexOf(randomNum) !== -1) {
                    randomNum = this._generateNumber(0, randomDist);
                }
                randomDistArray[randomDistArray.length] = randomNum;

                var offsetX = innerX + randomNum;
                innerX += randomDist;
                this._addIntoShape(offsetX, innerY, outerLeft, outerY, rectRoadShapes);

                var previousAngle = 0,
                    initialRandomDist = randomNum;

                while (innerX <= innerRight - initialDist) {
                    // Generate unique random number that is never comes before.
                    var angle = this._generateNumber(-20, 20);
                    while (randomAngleArray.indexOf(angle) !== -1) {
                        angle = this._generateNumber(-20, 20);
                    }
                    randomAngleArray[randomAngleArray.length] = angle;

                    var perpendicular = outerY - innerY;
                    var base = this._getBaseLength(angle, perpendicular);
                    var x;
                    if (angle < 0) {
                        x = offsetX - base;
                    }
                    else {
                        x = offsetX + base;
                    }
                    this._addIntoShape(offsetX, innerY, x, outerY, rectRoadShapes);

                    innerX += horizontalMidDist;
                    if (innerX < innerRight - initialDist) {
                        // Generate unique random number that is never comes before.
                        randomNum = this._generateNumber(0, randomDist);
                        while (randomDistArray.indexOf(randomNum) !== -1) {
                            randomNum = this._generateNumber(0, randomDist);
                        }
                        randomDistArray[randomDistArray.length] = randomNum;

                        offsetX = innerX + randomNum;
                        innerX += randomDist;
                    }
                }
                this._addIntoShape(offsetX, innerY, outerRight, outerY, rectRoadShapes);
            }

            randomAngleArray = [];
            initialDist = 20;
            var verticalMidDist = 84;

            // Break the left and right pieces of the rectangular road.
            for (var count = 0; count < 2; count++) {
                var innerX, outerX;

                if (count === 0) {
                    // For breaking right pieces.
                    innerX = innerRight;
                    outerX = outerRight;
                }
                else {
                    // For breaking left pieces
                    innerX = innerLeft;
                    outerX = outerLeft;
                }

                var innerY = innerTop + initialDist;
                var previousAngle = 0;

                while (innerY <= innerBottom - initialDist) {
                    var randomNum = this._generateNumber(0, randomDist);
                    var offsetY = innerY + randomNum;
                    innerY += randomDist;

                    // Generate unique random number that is never comes before.
                    var angle = this._generateNumber(-10, 10);
                    while (randomAngleArray.indexOf(angle) !== -1) {
                        angle = this._generateNumber(-10, 10);
                    }
                    randomAngleArray[randomAngleArray.length] = angle;

                    var perpendicular = outerX - innerX;
                    var base = this._getBaseLength(angle, perpendicular);

                    var y;
                    if (angle < 0) {
                        y = offsetY - base;
                    }
                    else {
                        y = offsetY + base;
                    }
                    this._addIntoShape(innerX, offsetY, outerX, y, rectRoadShapes);
                    innerY += verticalMidDist;
                }
            }

            // Set shapes array in the order of top, right, left, bottom.
            rectRoadShapes = rectRoadShapes.concat(rectRoadShapes.splice(6, 6));

            // Create shapes by adding adjacent points.
            var length = rectRoadShapes.length;

            // Reverse the latter half array for having shapes in correct sequence.
            rectRoadShapes = rectRoadShapes.concat(rectRoadShapes.splice(length / 2, length / 2).reverse());

            // Adding segments of next line in to previous one for completing shape.
            var shapes = [];
            for (var i = 0; i < length; i++) {
                var shape = [];
                shape = rectRoadShapes[i].concat(rectRoadShapes[(i + 1) % length]);
                shapes[i] = shape;
            }
            rectRoadShapes = shapes;

            // Remove duplicate entry from triangle shapes.
            rectRoadShapes[0].splice(2, 1);
            rectRoadShapes[4].splice(2, 1);
            rectRoadShapes[8].splice(2, 1);
            rectRoadShapes[12].splice(2, 1);

            // Add additional corner point in corner shapes.
            var upperRight = { x: innerRight, y: innerTop };
            var bottomRight = { x: innerRight, y: innerBottom };
            var bottomLeft = { x: innerLeft, y: innerBottom };
            var upperLeft = { x: innerLeft, y: innerTop };
            rectRoadShapes[5].push(upperRight);
            rectRoadShapes[7].push(bottomRight);
            rectRoadShapes[13].push(bottomLeft);
            rectRoadShapes[15].push(upperLeft);

            // Swapping entries in all shapes(other than triangles) for having continuous points.
            for (var i = 0; i < length; i++) {
                if (i === 0 || i === 4 || i === 8 || i === 12) {
                    continue;
                }
                var points = rectRoadShapes[i];
                var temp = points[2];
                points[2] = points[3];
                points[3] = temp;
            }

            // Generate segments for each shape to which it is going to snap.
            this._generateSnapeSegments(rectRoadShapes, rectRoadSnapSegments);

            // Create the collection of each shape as model.
            var shapeCollection = this.createShapeCollection(rectRoadShapes, rectRoadSnapSegments);

            // Set the collection.
            this.set('shapeCollection', shapeCollection);
        },

        /**
        * Generate the pieces of the Z shaped road.
        *
        * @method _generateZRoadShapes
        * @private
        */
        _generateZRoadShapes: function () {
            var currentNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;

            var zRoadLeft = currentNamespace.ZROAD_OFFSET.LEFT;
            var zRoadTop = currentNamespace.ZROAD_OFFSET.TOP;
            var zRoadBottom = currentNamespace.ZROADTOTALHEIGHT + zRoadTop;
            var zRoadRight = currentNamespace.ZROADTOTALWIDTH + zRoadLeft;

            var zRoadShapes = [];
            var zRoadSnapSegments = {};

            // Bottom triangle piece.
            var left = zRoadLeft,
                outerTop = zRoadBottom,
                innerTop = zRoadBottom - currentNamespace.ZROADWIDTH;

            var botoomHorizontalStartDist = 165,
                initialDist = 15,
                firstRandomDist = 30,
                halfRoadHeight = 201;

            var bottomTriRandomDist = -1,
                generatedAngles = [],
                sideQuadRandomDist = -1;

            left += botoomHorizontalStartDist;
            var randomNum = bottomTriRandomDist = this._generateNumber(0, firstRandomDist);
            left += randomNum;

            this._addIntoShape(left, outerTop, zRoadLeft, innerTop, zRoadShapes);

            // BottomLeft corner piece.
            var angle = this._generateNumber(-10, 10);
            while (Math.abs(angle) === 0) {
                angle = this._generateNumber(-10, 10);
            }
            generatedAngles[generatedAngles.length++] = angle;

            var perpendicular = currentNamespace.ZROADWIDTH,
                base = this._getBaseLength(angle, perpendicular),
                x;
            if (angle < 0) {
                x = left - base;
            }
            else {
                x = left + base;
            }
            this._addIntoShape(left, outerTop, x, innerTop, zRoadShapes);

            // BottomRight corner piece.
            var outerX = zRoadLeft + currentNamespace.ZROAD_BOTTOM_PATH_WIDTH,
                innerX = outerX - currentNamespace.ZROADWIDTH,
                outerY = zRoadBottom,
                innerY = zRoadBottom - currentNamespace.ZROADWIDTH;

            innerY -= initialDist;
            var randomNum = this._generateNumber(0, firstRandomDist);
            sideQuadRandomDist = randomNum;
            innerY -= randomNum;
            this._addIntoShape(outerX, outerY, innerX, innerY, zRoadShapes);

            // Vertically middle piece.
            var midY = outerY - halfRoadHeight;
            var angle = this._generateNumber(-10, 10);
            while (angle === generatedAngles[0]) {
                angle = this._generateNumber(-10, 10);
            }
            generatedAngles[generatedAngles.length++] = angle;

            var perpendicular = currentNamespace.ZROADWIDTH;
            var base = this._getBaseLength(angle, perpendicular);
            var y;
            if (angle < 0) {
                y = midY + base;
            }
            else {
                y = midY - base;
            }
            this._addIntoShape(outerX, midY, innerX, y, zRoadShapes);

            // Vertically top piece.
            var topY = zRoadTop;
            outerY = topY + currentNamespace.ZROADWIDTH;
            outerY += initialDist;
            var randomNum = this._generateNumber(0, firstRandomDist);
            while (Math.abs(randomNum - sideQuadRandomDist) < 5) {
                randomNum = this._generateNumber(0, firstRandomDist);
            }
            outerY += randomNum;
            this._addIntoShape(outerX, outerY, innerX, topY, zRoadShapes);

            // Right corner piece.
            var left = zRoadRight;
            var innerTop = zRoadTop;
            var outerTop = zRoadTop + currentNamespace.ZROADWIDTH;

            left -= 165;
            var randomNum = this._generateNumber(0, firstRandomDist);
            while (Math.abs(randomNum - bottomTriRandomDist) < 7) {
                randomNum = this._generateNumber(0, firstRandomDist);
            }
            left -= randomNum;
            this._addIntoShape(zRoadRight, outerTop, left, innerTop, zRoadShapes);

            // Top corner piece.
            var angle = this._generateNumber(-10, 10);
            while (Math.abs(angle) === 0 || angle === generatedAngles[0] || angle === generatedAngles[1]) {
                angle = this._generateNumber(-10, 10);
            }
            var perpendicular = currentNamespace.ZROADWIDTH;
            var base = this._getBaseLength(angle, perpendicular);
            var x;
            if (angle < 0) {
                x = left + base;
            }
            else {
                x = left - base;
            }
            this._addIntoShape(x, outerTop, left, innerTop, zRoadShapes);

            // Create shapes by adding adjacent points. 
            var length = zRoadShapes.length;
            // Reverse the positions of last two shapes(shapes from upper right) for having in correct sequence.
            zRoadShapes = zRoadShapes.concat(zRoadShapes.splice(length - 2, 2).reverse());

            var shapes = [];
            shapes[0] = zRoadShapes[0];
            for (var i = 0; i < length; i++) {
                var shape = [];

                if (i == length - 1) {
                    shapes[i + 1] = zRoadShapes[i];
                }
                else {
                    shape = zRoadShapes[i].concat(zRoadShapes[i + 1]);
                    shapes[i + 1] = shape;
                }
            }
            zRoadShapes = shapes;

            // Remove duplicate entry from triangle shapes
            zRoadShapes[1].splice(2, 1);
            zRoadShapes[6].splice(3, 1);

            // Add additional point in corner shapes
            var bottomMiddle = { x: zRoadLeft + currentNamespace.ZROAD_BOTTOM_PATH_WIDTH - currentNamespace.ZROADWIDTH, y: zRoadBottom - currentNamespace.ZROADWIDTH };
            var topMiddle = { x: zRoadLeft + currentNamespace.ZROAD_BOTTOM_PATH_WIDTH, y: zRoadTop + currentNamespace.ZROADWIDTH };
            var bottomLeft = { x: zRoadLeft, y: zRoadBottom };
            var rightTop = { x: zRoadRight, y: zRoadTop };
            zRoadShapes[2].push(bottomMiddle);
            zRoadShapes[5].push(topMiddle);
            zRoadShapes[0].push(bottomLeft);
            zRoadShapes[7].push(rightTop);

            // Swapping entries in all shapes(other than triangles) for having continuous points.
            for (var i = 0; i < length; i++) {
                if (i == 2 || i == 3 || i == 4) {
                    var points = zRoadShapes[i];
                    var temp = points[0];
                    points[0] = points[1];
                    points[1] = temp;
                }
                if (i == 5) {
                    var points = zRoadShapes[i];
                    var temp = points[2];
                    points[2] = points[3];
                    points[3] = temp;
                }
            }

            // Generate segments for each shape to which it is going to snap.
            this._generateSnapeSegments(zRoadShapes, zRoadSnapSegments);
            // Reverse some entries for correct snapping sequence.
            zRoadSnapSegments["1"]["shape3"] = zRoadSnapSegments["1"]["shape3"].reverse();
            zRoadSnapSegments["6"]["shape8"] = zRoadSnapSegments["6"]["shape8"].reverse();
            zRoadSnapSegments["4"]["shape6"] = zRoadSnapSegments["4"]["shape6"].reverse();

            // Create the collection of shape as model.
            var shapeCollection = this.createShapeCollection(zRoadShapes, zRoadSnapSegments);

            // Set the collection.
            this.set('shapeCollection', shapeCollection);
        },

        /**
        * Get the initial position of all shapes with positions of different type of shape. 
        *
        * @method getZRoadShapesPosition
        * @private
        */
        _getShapesPosition: function () {
            var currentNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;

            var shapesPos = {};
            var count = 0, topOffest = 88;
            var positions = [];

            var slots, quadPos, otherPos;
            var pathDisplayed = this.get('pathDisplayed');

            if (pathDisplayed === currentNamespace.ROADTYPES.RECTANGLESHAPED) {
                slots = currentNamespace.RECTROAD_SHAPES_SLOT;
                quadPos = currentNamespace.RECTROAD_QUADPOSITIONS.slice(0);
                otherPos = currentNamespace.RECTROAD_OTHERPOSITIONS.slice(0);
            }
            else {
                slots = currentNamespace.ZROAD_SHAPES_SLOT;
                quadPos = currentNamespace.ZROAD_QUADPOSITIONS.slice(0);
                otherPos = currentNamespace.ZROAD_OTHERPOSITIONS.slice(0);
            }

            for (var i in slots) {
                var slot = slots[i];

                positions[count++] = {
                    x: slot.LEFT + (slot.WIDTH / 2),
                    y: slot.TOP + (slot.HEIGHT / 2) - topOffest
                };
            }
            shapesPos[currentNamespace.POSITIONS] = positions;
            shapesPos[currentNamespace.QUADPOSITIONS] = quadPos;
            shapesPos[currentNamespace.OTHERPOSITIONS] = otherPos;

            return shapesPos;
        },

        /**
        * Set the angles type
        *
        * @method setAnglesType
        * @param collection{Backbone.Collection} Collection contains shape models
        * @private
        */
        setAnglesType: function (collection) {
            var currentNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;
            var pathDisplayed = this.get('pathDisplayed');

            var models = collection.models;
            var length = models.length;
            if (pathDisplayed === currentNamespace.ROADTYPES.RECTANGLESHAPED) {
                for (var i in models) {
                    i = parseInt(i);
                    if (i === 4 || i === 7 || i === 12 || i === 15) {
                        var next = (i + 1) % length;

                        var model = models[i];
                        var angles = model.get('angles');
                        angles[2].isSupplementary = false;

                        model = models[next];
                        angles = model.get('angles');
                        angles[1].isSupplementary = false;
                    }
                }
            }
            else {
                for (var i in models) {
                    i = parseInt(i);
                    if (i === 0) {
                        var next = (i + 1) % length;

                        var model = models[i];
                        var angles = model.get('angles');
                        angles[1].isSupplementary = false;

                        model = models[next];
                        angles = model.get('angles');
                        angles[1].isSupplementary = false;
                    }
                    if (i === 2) {
                        var next = (i + 1) % length;

                        var model = models[i];
                        var angles = model.get('angles');
                        angles[2].isSupplementary = false;

                        model = models[next];
                        angles = model.get('angles');
                        angles[1].isSupplementary = false;
                    }
                    if (i === 4) {
                        var next = (i + 1) % length;

                        var model = models[i];
                        var angles = model.get('angles');
                        angles[3].isSupplementary = false;

                        model = models[next];
                        angles = model.get('angles');
                        angles[1].isSupplementary = false;
                    }
                    if (i === 6) {
                        var next = (i + 1) % length;

                        var model = models[i];
                        var angles = model.get('angles');
                        angles[2].isSupplementary = false;

                        model = models[next];
                        angles = model.get('angles');
                        angles[0].isSupplementary = false;
                    }
                }
            }
        },

        /**
        * Creating collection of shape models
        *
        * @method createShapeCollection
        * @param shapes{object} Shape contains array of all vertex(points)
        * @param shapeSnapSegments{object} Snape segments for each shape
        * @private
        */
        createShapeCollection: function (shapes, shapeSnapSegments) {
            var currentNamespace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads;

            var pathDisplayed = this.get('pathDisplayed');

            var shapesPos = this._getShapesPosition();

            var positions = shapesPos[currentNamespace.POSITIONS],
                quadPos = shapesPos[currentNamespace.QUADPOSITIONS],
                otherPos = shapesPos[currentNamespace.OTHERPOSITIONS];

            // Creating model for shape.
            var ShapeModel = MathInteractives.Interactivities.PicturePerfect.Models.Shape;
            var shapeCollection = new MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads.ShapeCollection();

            for (var i = 0; i < shapes.length; i++) {
                // Get the initial random position of current shape.
                var position, arrPos;
                if (pathDisplayed === currentNamespace.ROADTYPES.RECTANGLESHAPED) {
                    if (shapes[i].length === 4) {
                        arrPos = quadPos;
                    }
                    else {
                        arrPos = otherPos;
                    }
                }
                else {
                    if (shapes[i].length === 5) {
                        arrPos = otherPos;
                    }
                    else {
                        arrPos = quadPos;
                    }
                }
                var index = this._generateNumber(0, arrPos.length - 1);
                var posIndex = arrPos[index] - 1;
                position = positions[posIndex];
                arrPos.splice(index, 1);

                // Get the angles at all points.
                var angles = this._getAngles(shapes[i]);

                // Get the shape type.
                var shapeType = -1;
                switch (shapes[i].length) {
                    case 3: {
                        shapeType = ShapeModel.SHAPE_TYPE.TRIANGULAR;
                        break;
                    }
                    case 4: {
                        shapeType = ShapeModel.SHAPE_TYPE.QUADRILATERAL;
                        break;
                    }
                    case 5: {
                        shapeType = ShapeModel.SHAPE_TYPE.CORNER;
                        break;
                    }
                }

                // Create shape model
                var shapeData = new ShapeModel();
                shapeData.set({
                    "name": "shape" + (i + 1),
                    "groupName": "shapeGroup" + (i + 1),
                    "segments": shapes[i],
                    "snapIndices": shapeSnapSegments[i],
                    "rotation": this._generateNumber(-180, 180),
                    "position": position,
                    "angles": angles,
                    "type": shapeType,
                    "slotNumber": posIndex
                });
                shapeCollection.add(shapeData);
            }

            return shapeCollection;
        },

        /**
        * Generate the end coordinates of both paths
        *
        * @method generatePathCoordinates
        */
        generatePathCoordinates: function () {
            this._generateRectPathCoordinates();
            this._generateZPathCoordinates();
        },

        /**
        * Generate the end coordinates of Rect shape path
        *
        * @method _generateRectPathCoordinates
        * @private
        */
        _generateRectPathCoordinates: function () {
            var nameSpace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                xOffset = nameSpace.RECTROAD_OFFSET.LEFT,
                yOffset = nameSpace.RECTROAD_OFFSET.TOP,
                snapOffset = nameSpace.RECTROAD_OFFSET.SNAP,
                outerRectWidth = nameSpace.OUTERROADWIDTH,
                outerRectHeight = nameSpace.OUTERROADHEIGHT,
                innerRectWidth = nameSpace.INNERROADWIDTH,
                innerRectHeight = nameSpace.INNERROADHEIGHT,
                roadHeight = (outerRectHeight - innerRectHeight) / 2,
                roadWidth = (outerRectWidth - innerRectWidth) / 2,

                outerRectCoordinates = [
                    {
                        x: xOffset - snapOffset,
                        y: yOffset - snapOffset
                    },
                    {
                        x: xOffset + outerRectWidth + snapOffset,
                        y: yOffset - snapOffset
                    },
                    {
                        x: xOffset + outerRectWidth + snapOffset,
                        y: yOffset + outerRectHeight + snapOffset
                    },
                    {
                        x: xOffset - snapOffset,
                        y: yOffset + outerRectHeight + snapOffset
                    }
                ],

                innerRectCoordinates = [
                    {
                        x: xOffset + roadWidth + snapOffset,
                        y: yOffset + roadHeight + snapOffset
                    },
                    {
                        x: xOffset + roadWidth + innerRectWidth - snapOffset,
                        y: yOffset + roadHeight + snapOffset
                    },
                    {
                        x: xOffset + roadWidth + innerRectWidth - snapOffset,
                        y: yOffset + +roadHeight + innerRectHeight - snapOffset
                    },
                    {
                        x: xOffset + roadWidth + snapOffset,
                        y: yOffset + +roadHeight + innerRectHeight - snapOffset
                    }
                ];

            this.set('rectPathCoordinates', {
                outerRectCoordinates: outerRectCoordinates,
                innerRectCoordinates: innerRectCoordinates
            });
        },

        /**
        * Generate the end coordinates of Z shape path
        *
        * @method _generateZPathCoordinates
        * @private
        */
        _generateZPathCoordinates: function () {
            var nameSpace = MathInteractives.Interactivities.PicturePerfect.Models.RepairRoads,
                xOffset = nameSpace.ZROAD_OFFSET.LEFT,
                yOffset = nameSpace.ZROAD_OFFSET.TOP,
                snapOffset = nameSpace.ZROAD_OFFSET.SNAP,
                roadWidth = nameSpace.ZROADWIDTH,
                totalWidth = nameSpace.ZROADTOTALWIDTH,
                totalHeight = nameSpace.ZROADTOTALHEIGHT,
                bottomPathWidth = nameSpace.ZROAD_BOTTOM_PATH_WIDTH,
                topPathWidth = nameSpace.ZROAD_TOP_PATH_WIDTH,
                zPathCoordinates = [
                    {
                        x: xOffset - snapOffset,
                        y: yOffset + totalHeight - roadWidth - snapOffset
                    },
                    {
                        x: xOffset - snapOffset,
                        y: yOffset + totalHeight + snapOffset
                    },
                    {
                        x: xOffset + bottomPathWidth + snapOffset,
                        y: yOffset + totalHeight + snapOffset
                    },
                    {
                        x: xOffset + bottomPathWidth + snapOffset,
                        y: yOffset + roadWidth + snapOffset
                    },
                    {
                        x: xOffset + totalWidth + snapOffset,
                        y: yOffset + roadWidth + snapOffset
                    },
                    {
                        x: xOffset + totalWidth + snapOffset,
                        y: yOffset - snapOffset
                    },
                    {
                        x: xOffset + totalWidth - topPathWidth - snapOffset,
                        y: yOffset - snapOffset
                    },
                    {
                        x: xOffset + totalWidth - topPathWidth - snapOffset,
                        y: yOffset + totalHeight - roadWidth - snapOffset
                    }
                ];

            this.set('zPathCoordinates', zPathCoordinates);
        }

    }, {

        /**
        * Collection of pieces
        *
        * @property pieceCollection
        * @type Backbone.Collection
        * @final
        */
        ShapeCollection: Backbone.Collection.extend({
            model: MathInteractives.Interactivities.PicturePerfect.Models.Shape,
            initialize: function () {
                this.model = MathInteractives.Interactivities.PicturePerfect.Models.Shape;
            }
        }),

        /**
        * The types of road
        *
        * @property ROADTYPES
        * @static
        */
        ROADTYPES: {
            RECTANGLESHAPED: 0,
            ZSHAPED: 1
        },

        /**
        * Width of the outer road
        *
        * @property OUTERROADWIDTH
        * @static
        */
        OUTERROADWIDTH: 708,

        /**
        * Height of the outer road.
        *
        * @property OUTERROADHEIGHT
        * @static
        */
        OUTERROADHEIGHT: 350,

        /**
        * Width of the inner road.
        *
        * @property INNERROADWIDTH
        * @static
        */
        INNERROADWIDTH: 492,

        /**
        * Height of the inner road.
        *
        * @property INNERROADHEIGHT
        * @static
        */
        INNERROADHEIGHT: 154,

        /**
        * Key value for shape position map depict positions of all shape.
        *
        * @property POSITIONS
        * @static
        */
        POSITIONS: "positions",

        /**
        * Key value for shape position map depict positions of quadrilaterals.
        *
        * @property QUADPOSITIONS
        * @static
        */
        QUADPOSITIONS: "quadPositions",

        /**
        * Key value for shape position map depict positions of all other shapes than quadrilaterals.
        *
        * @property OTHERPOSITIONS
        * @static
        */
        OTHERPOSITIONS: "otherPositions",

        /**
        * Total width of z shaped road.
        *
        * @property ZROADTOTALWIDTH
        * @static
        */
        ZROADTOTALWIDTH: 401 + 420 - 96,

        /**
        * Total Height of z shaped road.
        *
        * @property ZROADTOTALWIDTH
        * @static
        */
        ZROADTOTALHEIGHT: 403,

        /**
        * Width of z shaped road.
        *
        * @property ZROADTOTALWIDTH
        * @static
        */
        ZROADWIDTH: 96,

        /**
        * Width of bottom path of z shaped road.
        *
        * @property ZROAD_BOTTOM_PATH_WIDTH
        * @static
        */
        ZROAD_BOTTOM_PATH_WIDTH: 401,

        /**
        * Width of top path of z shaped road.
        *
        * @property ZROAD_TOP_PATH_WIDTH
        * @static
        */
        ZROAD_TOP_PATH_WIDTH: 420,

        /**
        * Background Classes for changing images in background
        *
        * @property BACKGROUND_CLASSES
        * @static
        */
        BACKGROUND_CLASSES: {
            ZIGZAG: 'zigzag-path',
            BROKEN_ZIGZAG: 'broken-zigzag-path',
            RECTANGLE: 'rectangle-path',
            BROKEN_RECTANGLE: 'broken-rectangle-path'
        },

        /**
        * Slots of z road shapes
        *
        * @property ZROAD_SHAPES_SLOT
        * @static
        */
        ZROAD_SHAPES_SLOT: [
            {
                LEFT: 13,
                TOP: 246,
                WIDTH: 234,
                HEIGHT: 184
            },
            {
                LEFT: 105,
                TOP: 101,
                WIDTH: 236,
                HEIGHT: 126
            },
            {
                LEFT: 394,
                TOP: 105,
                WIDTH: 236,
                HEIGHT: 126
            },
            {
                LEFT: 271,
                TOP: 251,
                WIDTH: 236,
                HEIGHT: 126
            },
            {
                LEFT: 276,
                TOP: 392,
                WIDTH: 234,
                HEIGHT: 184
            },
            {
                LEFT: 672,
                TOP: 99,
                WIDTH: 126,
                HEIGHT: 236
            },
            {
                LEFT: 519,
                TOP: 364,
                WIDTH: 236,
                HEIGHT: 126
            },
            {
                LEFT: 780,
                TOP: 350,
                WIDTH: 126,
                HEIGHT: 236
            }
        ],

        /**
        * Positions of the quadrilateral shapes
        *
        * @property ZROAD_QUADPOSITIONS
        * @static
        */
        ZROAD_QUADPOSITIONS: [2, 3, 4, 6, 7, 8],

        /**
        * Positions of the all other shapes
        *
        * @property ZROAD_QUADPOSITIONS
        * @static
        */
        ZROAD_OTHERPOSITIONS: [1, 5],

        /**
        * Slots of rect road shapes
        *
        * @property RECTROAD_SHAPES_SLOT
        * @static
        */
        RECTROAD_SHAPES_SLOT: [
            {
                LEFT: 9,
                TOP: 92,
                WIDTH: 178,
                HEIGHT: 216
            },
            {
                LEFT: 164,
                TOP: 96,
                WIDTH: 222,
                HEIGHT: 118
            },
            {
                LEFT: 360,
                TOP: 90,
                WIDTH: 222,
                HEIGHT: 118
            },
            {
                LEFT: 556,
                TOP: 90,
                WIDTH: 178,
                HEIGHT: 216
            },
            {
                LEFT: 693,
                TOP: 106,
                WIDTH: 216,
                HEIGHT: 178
            },
            {
                LEFT: 0,
                TOP: 279,
                WIDTH: 222,
                HEIGHT: 118
            },
            {
                LEFT: 159,
                TOP: 162,
                WIDTH: 178,
                HEIGHT: 216
            },
            {
                LEFT: 261,
                TOP: 225,
                WIDTH: 225,
                HEIGHT: 216
            },
            {
                LEFT: 473,
                TOP: 189,
                WIDTH: 178,
                HEIGHT: 216
            },
            {
                LEFT: 612,
                TOP: 307,
                WIDTH: 222,
                HEIGHT: 118
            },
            {
                LEFT: 3,
                TOP: 417,
                WIDTH: 216,
                HEIGHT: 178
            },
            {
                LEFT: 164,
                TOP: 374,
                WIDTH: 222,
                HEIGHT: 118
            },
            {
                LEFT: 395,
                TOP: 365,
                WIDTH: 222,
                HEIGHT: 118
            },
            {
                LEFT: 313,
                TOP: 480,
                WIDTH: 222,
                HEIGHT: 118
            },
            {
                LEFT: 518,
                TOP: 402,
                WIDTH: 216,
                HEIGHT: 178
            },
            {
                LEFT: 706,
                TOP: 414,
                WIDTH: 216,
                HEIGHT: 178
            }
        ],

        /**
        * Positions of the quadrilateral shapes
        *
        * @property RECTROAD_QUADPOSITIONS
        * @static
        */
        RECTROAD_QUADPOSITIONS: [2, 3, 6, 8, 10, 12, 13, 14],

        /**
        * Positions of the all other shapes
        *
        * @property RECTROAD_OTHERPOSITIONS
        * @static
        */
        RECTROAD_OTHERPOSITIONS: [1, 4, 5, 7, 9, 11, 15, 16],

        /**
        * Cursor type
        *
        * @property CURSOR_TYPE
        * @static
        */
        CURSOR_TYPE: {
            DEFAULT: 0,
            OPEN_HAND: 1,
            CLOSE_HAND: 2
        },

        /**
        * Rect road offset
        *
        * @property RECTROAD_OFFSET
        * @static
        */
        RECTROAD_OFFSET: {
            TOP: 90,
            LEFT: 89,
            SNAP: 20
        },

        /**
        * Z road offset
        *
        * @property ZROAD_OFFSET
        * @static
        */
        ZROAD_OFFSET: {
            TOP: 55,
            LEFT: 67,
            SNAP: 20
        },

        /**
        * Path snap offset
        *
        * @property PATH_SNAP_OFFSET
        * @static
        */
        PATH_SNAP_OFFSET: 20
    });

})();