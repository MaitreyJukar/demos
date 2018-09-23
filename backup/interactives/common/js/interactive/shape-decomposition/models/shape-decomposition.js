( function () {
    'use strict';
    //defining namespace
    if ( typeof MathInteractives.Interactivities.ShapeDecomposition === 'undefined' ) {
        MathInteractives.Common.Interactivities.ShapeDecomposition = {};
        MathInteractives.Common.Interactivities.ShapeDecomposition.Views = {};
        MathInteractives.Common.Interactivities.ShapeDecomposition.Models = {};
    }

    /*
	*
	*   D E S C R I P T I O N
	*
	* @class ShapeDecompositionData
	* @namespace MathInteractives.Common.Interactivities.ShapeDecomposition.Views
    * @extends MathInteractives.Common.Player.Models.Base
	* @constructor
	*/

    MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData = MathInteractives.Common.Player.Models.Base.extend( {

        defaults: function () {
            return {
                /**
                * Elements of Help Screen
                * @property helpElements
                * @type Array
                * @default Empty
                **/
                helpElements: [],   // Please keep all the references null in defaults.
                /**
                * Stores All Shapes objects on each action
                * @property undoStack
                * @type Array
                * @default Empty
                **/
                undoStack: null,

                dragPartners: null,

                vertexDragRestrictions: null,

                /**
                * Stores All coordinates of current polygons
                * @property polygonVertexUndoStack
                * @type Array
                * @default Empty
                **/
                polygonVertexUndoStack: null,
                /**
                * Stores All points which are on boundary of polygon.
                * @property polygonBoundaryPointsUndoStack
                * @type Array
                * @default Empty
                **/
                polygonBoundaryPointsUndoStack: null
            };
        },

        static: null,

        /**
        * Initialises ShapeDecompositionData
        *
        * @method initialize
        **/
        initialize: function () {
            this.static = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData;
            if ( this.get( 'undoStack' ) === null ) {
                this.set( 'undoStack', [] );
            }
            if ( this.get( 'polygonVertexUndoStack' ) === null ) {
                this.set( 'polygonVertexUndoStack', [] );
            }
            if ( this.get( 'polygonBoundaryPointsUndoStack' ) === null ) {
                this.set( 'polygonBoundaryPointsUndoStack', [] );
            }
            //if ( this.get( 'helpElements' ) === null ) {
            //    this.set( 'helpElements', [] );
            //}
        },

        /**
        * returns shapes start point
        *
        * @method getShapesStartIndex
        **/
        getShapesStartIndex: function getShapesStartIndex( callFrom ) {
            var defaultShapeStartIndex;
            if ( callFrom === 'render' ) {
                defaultShapeStartIndex = [52, 57, 69, 302, 308, 457, 442, 263, 289];
            }
            else if ( callFrom === 'selected' ) {
                defaultShapeStartIndex = [185, 209, 187, 210, 260, 310, 259, 184, 210, 283];
            }
            return defaultShapeStartIndex;
        },

        /**
        * returns default shapes
        *
        * @method getDefaultShapes
        **/
        getDefaultShapes: function getDefaultShapes( index ) {
            var defaultShapeIndexes = [[150, 5, -103, -50, -2],
                                       [50, 79, -50, 1, -48, -25, -7],
                                       [48, 127, -123, -52],
                                       [100, 1, -25, 3, -50, -2, -25, -2],
                                       [-25, -24, 1, 26, 25, 24, -1, -26],
                                       [-25, -72, 76, 25, -4],
                                       [-48, 27, -24, 50, -1, 23, -27],
                                       [75, 51, 2, -48, -75, -5],
                                       [50, 3, -50, -3],
                                       [-72, 3, 77, -8]];
            return defaultShapeIndexes[index];
        },

        /**
        * Adds New Entry To UndoStack
        *
        * @method addEntryToUndoStack
        **/
        addEntryToUndoStack: function addEntryToUndoStack( shapesArray ) {
            var undoArray = this.get( 'undoStack' ),
                pointArray = [],
                objectsArray = [],
                object = {},
                string1,
                string2,
                bool = true;

            for ( var i = 0; i < shapesArray.length; i++ ) {
                pointArray = [];
                if ( shapesArray[i].isOddShape ) {
                    for ( var j = 0; j < shapesArray[i].children.length; j++ ) {
                        var arr = [];
                        for ( var k = 0; k < shapesArray[i].children[j].segments.length; k++ ) {
                            arr.push( this.getIndexOfPoint( shapesArray[i].children[j].segments[k].point ) );
                        }
                        pointArray.push( arr );
                    }
                    object.isOddShape = true;
                }
                else {
                    for ( var j = 0; j < shapesArray[i].segments.length; j++ ) {
                        pointArray.push( this.getIndexOfPoint( shapesArray[i].segments[j].point ) );
                    }
                    object.isOddShape = false;
                }
                object.shapePoints = pointArray;
                object.shapeUniqueCode = shapesArray[i].shapeUniqueCode;
                object.isOriginal = shapesArray[i].isOriginal;
                object.isSelected = shapesArray[i].isSelected;
                objectsArray.push( $.extend( true, {}, object ) );
                object = {};
            }
            undoArray.push( objectsArray );
            if ( undoArray.length >= 2 ) {
                string1 = JSON.stringify( undoArray[undoArray.length - 1], function ( key, value ) { if ( key === 'userInput' ) return undefined; return value; } );
                string2 = JSON.stringify( undoArray[undoArray.length - 2], function ( key, value ) { if ( key === 'userInput' ) return undefined; return value; } );
                if ( string1 === string2 ) { undoArray.pop(); bool = false; }
                if ( undoArray.length === 1 ) this.trigger( this.static.EVENTS.DISABLE_BUTTON, this.static.ACTION_ENUM.UNDO, true );
            }
            this.set( 'undoStack', undoArray );
            return bool;
        },

        /**
        * returns index of point
        *
        * @method getIndexOfPoint
        **/
        getIndexOfPoint: function getIndexOfPoint( point ) {
            var x, y,
                ans;
            if ( !this.isInteger( point.x ) ) return -1;
            if ( !this.isInteger( point.y ) ) return -1;
            x = ( point.x - this.static.GRID_START_X ) / this.static.GAP_BETWEEN_POINTS;
            y = ( point.y - this.static.GRID_START_Y ) / this.static.GAP_BETWEEN_POINTS;
            if ( !this.isInteger( x ) ) return -1;
            if ( !this.isInteger( y ) ) return -1;
            ans = ( y * this.static.NUMBER_OF_X_POINTS ) + x;
            return ( this.isInteger( ans ) ) ? ans : -1;
        },

        /**
        * returns whether current point is integer or not.
        *
        * @method isInteger
        **/
        isInteger: function isInteger( number ) {
            return ( number % 1 === 0 ) ? true : false;
        },

        /**
        * returns data of shapes coordinate
        *
        * @method getDataOfShape
        **/
        getDataOfShape: function getDataOfShape( shapeCode ) {
            return this.get( 'dragPartners' )[shapeCode];
        },

        /**
        * returns data of restricted coordinate
        *
        * @method getRestrictedPoints
        **/
        getRestrictedPoints: function getRestrictedPoints( shapeCode ) {
            //In this restrictX contains 2 values. One is left minimum point and second is right maximum point
            //In this restrictY contains 2 values. One is top minimum point and second is bottom maximum point
            return this.get( 'vertexDragRestrictions' )[shapeCode];
        },

        /**
        * returns current Boundary points of all shapes;
        *
        * @method getBoundaryPoints
        **/
        getBoundaryPoints: function getBoundaryPoints() {
            var boundaryPointsUndoStack = this.get( 'polygonBoundaryPointsUndoStack' );
            return boundaryPointsUndoStack[boundaryPointsUndoStack.length - 1];
        },

        /**
        * returns Boundary points shape.
        *
        * @method getBoundaryPointOfShape
        **/
        getBoundaryPointOfShape: function getBoundaryPointOfShape( shapeCode ) {
            var boundaryPointsUndoStack = this.get( 'polygonBoundaryPointsUndoStack' ),
                currentShapesPoints = boundaryPointsUndoStack[boundaryPointsUndoStack.length - 1];
            for ( var i = 0; i < currentShapesPoints.length; i++ ) {
                if ( shapeCode === currentShapesPoints[i].shapeUniqueCode ) {
                    return currentShapesPoints[i].boundaryPointArray;
                }
            }
        },

        /**
        * returns Boundary points shape.
        *
        * @method getBoundaryPointOfShape
        **/
        getBoundaryPointOfShapeObject: function getBoundaryPointOfShapeObject( shapeCode ) {
            var boundaryPointsUndoStack = this.get( 'polygonBoundaryPointsUndoStack' ),
                currentShapesPoints = boundaryPointsUndoStack[boundaryPointsUndoStack.length - 1];
            for ( var i = 0; i < currentShapesPoints.length; i++ ) {
                if ( shapeCode === currentShapesPoints[i].shapeUniqueCode ) {
                    return currentShapesPoints[i];
                }
            }
        },

        /**
        * returns selected shape window coordinates
        *
        * @method getSelectedShapeWindowCoordinates
        **/
        getSelectedShapeWindowCoordinates: function getSelectedShapeWindowCoordinates() {
            var selectedShapeWindowArray = [[0, 24, 524, 500, 0],
                                           [132, 142, 392, 382, 132]];
            return selectedShapeWindowArray;
        }
    }, {

        /**
        * Gives Nearest Point.
        * @method getNearestPoint
        * @param point {Object} The point object with x & y coordinates.
        * @param pointsArray {Array} Array containing all grid points.
        * @public
        * @static
        **/
        getNearestPoint: function getNearestPoint( point, pointsArray ) {
            var object, objectY,
                modelNamespace = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData;
            object = null;

            if ( ( point.x >= modelNamespace.BOUNDING_BOX_LEFT && point.x <= modelNamespace.BOUNDING_BOX_RIGHT ) && ( point.y >= modelNamespace.BOUNDING_BOX_TOP && point.y <= modelNamespace.BOUNDING_BOX_BOTTOM ) ) {
                for ( var i = 0; i < pointsArray.length; i++ ) {
                    if ( ( pointsArray[i].x < ( point.x + modelNamespace.GAP_BETWEEN_POINTS ) && pointsArray[i].x > ( point.x - modelNamespace.GAP_BETWEEN_POINTS ) ) && ( pointsArray[i].y < ( point.y + modelNamespace.GAP_BETWEEN_POINTS ) && pointsArray[i].y > ( point.y - modelNamespace.GAP_BETWEEN_POINTS ) ) ) {
                        var diffX = point.x - pointsArray[i].x,
                            diffY = point.y - pointsArray[i].y;
                        diffX = ( diffX < 0 ) ? diffX * -1 : diffX;
                        diffY = ( diffY < 0 ) ? diffY * -1 : diffY;

                        if ( object === null ) {
                            object = {};
                            object.diffX = diffX;
                            object.diffY = diffY;
                            object.changeX = 0;
                            object.changeY = 0;
                            object.index = i;
                        }
                        else {
                            if ( object.diffX >= diffX && object.diffY >= diffY ) {
                                object = {};
                                object.diffX = diffX;
                                object.diffY = diffY;
                                object.changeX = 0;
                                object.changeY = 0;
                                object.index = i;
                            }
                        }
                    }
                }
            }
            else {
                var diffX = 0, diffY = 0;
                if ( point.x < modelNamespace.BOUNDING_BOX_LEFT ) { diffX = modelNamespace.BOUNDING_BOX_LEFT - point.x; point.x = modelNamespace.BOUNDING_BOX_LEFT; }
                if ( point.x > modelNamespace.BOUNDING_BOX_RIGHT ) { diffX = point.x - modelNamespace.BOUNDING_BOX_LEFT; point.x = modelNamespace.BOUNDING_BOX_RIGHT; }
                if ( point.y < modelNamespace.BOUNDING_BOX_TOP ) { diffY = modelNamespace.BOUNDING_BOX_TOP - point.y; point.y = modelNamespace.BOUNDING_BOX_TOP; }
                if ( point.y > modelNamespace.BOUNDING_BOX_BOTTOM ) { diffY = point.y - modelNamespace.BOUNDING_BOX_BOTTOM; point.y = modelNamespace.BOUNDING_BOX_BOTTOM; }
                object = modelNamespace.getNearestPoint( point, pointsArray );
                object.changeX = diffX;
                object.changeY = diffY;
            }
            return object;
        },

        /**
        * Returns points which are on line
        * @method getOnlinePoint
        * @private
        */
        getOnlinePoint: function getOnlinePoint( x1, x2, x3, y1, y2, y3, subX, subY, pointsArray ) {
            var modelNamespace = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData,
                arr = [];
            if ( ( subX < 0 && subY === 0 ) || ( subY < 0 && subX === 0 ) || ( subX < 0 && subY < 0 ) || ( subX < 0 && subY > 0 ) ) {
                for ( var i = 0; i < pointsArray.length; i++ ) {
                    if ( modelNamespace.findPointsBetween( i, x1, x2, x3, y1, y2, y3, pointsArray ).bool ) {
                        arr.push( i );
                    }
                }
            }
            else if ( ( subX > 0 && subY === 0 ) || ( subY > 0 && subX === 0 ) || ( subX > 0 && subY > 0 ) || ( subX > 0 && subY < 0 ) ) {
                for ( var i = pointsArray.length - 1; i >= 0; i-- ) {
                    if ( modelNamespace.findPointsBetween( i, x1, x2, x3, y1, y2, y3, pointsArray ).bool ) {
                        arr.push( i );
                    }
                }
            }
            return arr;
        },

        /**
        * Finds Points In between two points
        * @method findPointsBetween
        * @private
        */
        findPointsBetween: function findPointsBetween( i, x1, x2, x3, y1, y2, y3, pointsArray ) {
            var modelNamespace = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData,
                slope1, slope2, isPointInBetween = false;
            x2 = pointsArray[i].x;
            y2 = pointsArray[i].y;
            slope1 = ( y2 - y1 ) / ( x2 - x1 );
            slope2 = ( y3 - y2 ) / ( x3 - x2 );

            if ( slope1 === slope2 ) {
                isPointInBetween = modelNamespace.checkForInBetween( x1, x2, x3, y1, y2, y3 );
                if ( isPointInBetween ) {
                    var result = {};
                    result.bool = true;
                    result.startX = x1;
                    result.startY = y1;
                    result.endX = x3;
                    result.endY = y3;
                    return result;
                }
            }
            var result = {};
            result.bool = false;
            return result;
        },

        /**
        * Checks whether point is on sides of polygon.
        * @method checkForOnLinePoint
        * @public
        */
        checkForOnLinePoint: function checkForOnLinePoint( x2, y2, vertexPoints ) {
            var x1, y1,
                x3, y3,
                slope1,
                slope2,
                isPointInBetween = false,
                modelNamespace = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData,
                firstpt = vertexPoints[0].point,
                lastPt = vertexPoints[vertexPoints.length - 1].point;
            if ( !( firstpt.x === lastPt.x && firstpt.y === lastPt.y ) ) {
                vertexPoints.push( vertexPoints[0] );
            }
            for ( var i = 0; i < vertexPoints.length - 1; i++ ) {
                x1 = vertexPoints[i].point.x;
                y1 = vertexPoints[i].point.y;
                x3 = vertexPoints[i + 1].point.x;
                y3 = vertexPoints[i + 1].point.y;
                slope1 = ( y2 - y1 ) / ( x2 - x1 );
                slope2 = ( y3 - y2 ) / ( x3 - x2 );

                if ( slope1 === slope2 ) {
                    isPointInBetween = modelNamespace.checkForInBetween( x1, x2, x3, y1, y2, y3 );
                    if ( isPointInBetween ) {
                        var result = {};
                        result.bool = true;
                        result.startX = x1;
                        result.startY = y1;
                        result.endX = x3;
                        result.endY = y3;
                        return result;
                    }
                }
            }
            var result = {};
            result.bool = false;
            return result;
        },

        /**
        * Checks whether point is in between two points
        * @method checkForInBetween
        * @public
        */
        checkForInBetween: function _checkForInBetween( x1, x2, x3, y1, y2, y3 ) {
            var resultX = false,
                resultY = false;
            //CHecking For X in between two points
            if ( x1 <= x3 ) {
                if ( x2 >= x1 && x2 <= x3 ) {
                    resultX = true;
                }
            }
            else if ( x1 >= x3 ) {
                if ( x2 <= x1 && x2 >= x3 ) {
                    resultX = true;
                }
            }

            //CHecking For Y in between two points
            if ( y1 <= y3 ) {
                if ( y2 >= y1 && y2 <= y3 ) {
                    resultY = true;
                }
            }
            else if ( y1 >= y3 ) {
                if ( y2 <= y1 && y2 >= y3 ) {
                    resultY = true;
                }
            }

            if ( resultX === true && resultY === true ) {
                return true;
            }
            else {
                return false;
            }
        },

        /**
        * Calculates and returns the centroid of the polygon passed.
        *
        * @method calcCenterOfMass
        * @param paperItem {Object} The paper.js object of the polygon.
        * @return {Object} The centroid point object with x, y co-ordinates.
        * @static
        */
        calcCenterOfMass: function calcCenterOfMass( paperItem ) {
            var outerChild, innerChild,
                modelNamespace = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData,
                outerChildCoM, innerChildCoM,
                outerChildArea, innerChildArea,
                segments, numberOfSegments,
                currentVertex, nextVertex,
                index,
                a, cX, cY, temp;
            if ( paperItem.children ) {
                outerChild = paperItem.children[0];
                innerChild = paperItem.children[1];
                outerChildArea = Math.abs( outerChild.area );
                innerChildArea = Math.abs( innerChild.area );
                outerChildCoM = modelNamespace.calcCenterOfMass( outerChild );
                innerChildCoM = modelNamespace.calcCenterOfMass( innerChild );
                cX = ( outerChildArea * outerChildCoM.x - innerChildArea * innerChildCoM.x ) / ( outerChildArea - innerChildArea );
                cY = ( outerChildArea * outerChildCoM.y - innerChildArea * innerChildCoM.y ) / ( outerChildArea - innerChildArea );
            }
            else {
                segments = paperItem.segments;
                numberOfSegments = segments.length;
                a = 0;
                cX = 0;
                cY = 0;
                for ( index = 0; index <= numberOfSegments - 1; index++ ) {
                    currentVertex = segments[index].point;
                    nextVertex = segments[( index + 1 ) % numberOfSegments].point;
                    a += currentVertex.x * nextVertex.y -
                        nextVertex.x * currentVertex.y;
                }
                a /= 2;
                for ( index = 0; index <= numberOfSegments - 1; index++ ) {
                    currentVertex = segments[index].point;
                    nextVertex = segments[( index + 1 ) % numberOfSegments].point;
                    temp = currentVertex.x * nextVertex.y -
                        nextVertex.x * currentVertex.y;
                    cX += ( currentVertex.x + nextVertex.x ) * temp;
                    cY += ( currentVertex.y + nextVertex.y ) * temp;
                }
                cX /= 6 * a;
                cY /= 6 * a;
            }
            return {
                x: cX,
                y: cY
            };
        },

        /**
        * Removes consecutive same value from array.
        *
        * @method removeSameNumbersFromArray
        * @param array {array} containing numbers
        * @static
        */
        removeSameNumbersFromArray: function removeSameNumbersFromArray( array ) {
            var removeIndex = [];
            for ( var i = 0; i < array.length - 1; i++ ) {
                if ( array[i] === array[i + 1] ) {
                    removeIndex.push( i );
                }
            }
            if ( removeIndex.length > 0 ) {
                removeIndex.sort( function ( a, b ) { return b - a } );
                for ( var i = 0; i < removeIndex.length; i++ ) {
                    array.splice( removeIndex[i], 1 );
                }
            }
        },

        /**
        * Sorts the array of intersections in ascending order of their x coordinates. To be passed in Array's sort
        * method as a sorting method.
        *
        * @method sortHorizontalIntersections
        * @param intersection1 {Object} One of the paper.js objects that one gets on path.getIntersections(otherPath).
        * @param intersection2 {Object} One of the paper.js objects that one gets on path.getIntersections(otherPath).
        * @static
        */
        sortHorizontalIntersections: function sortHorizontalIntersections( intersection1, intersection2 ) {
            if ( intersection1.point.x < intersection2.point.x ) {
                return -1;
            }
            else if ( intersection1.point.x > intersection2.point.x ) {
                return 1;
            }
            else return 0;
        },

        /**
        * Sorts the array of intersections in ascending order of their y coordinates. To be passed in Array's sort
        * method as a sorting method.
        *
        * @method sortVerticalIntersections
        * @param intersection1 {Object} One of the paper.js objects that one gets on path.getIntersections(otherPath).
        * @param intersection2 {Object} One of the paper.js objects that one gets on path.getIntersections(otherPath).
        * @static
        */
        sortVerticalIntersections: function sortVerticalIntersections( intersection1, intersection2 ) {
            if ( intersection1.point.y < intersection2.point.y ) {
                return -1;
            }
            else if ( intersection1.point.y > intersection2.point.y ) {
                return 1;
            }
            else return 0;
        },

        /**
        * Checks if the mid point of the two intersection points passed lies inside the shape, outside it or on the
        * shape's sides and returns the answer.
        *
        * @method getMidPointStatus
        * @param shape {Object} Paper.js object of the polygon.
        * @param intersection1 {Object} One of the two paper.js objects returned on getIntersections; must have
        * property point.
        * @param intersection2 {Object} One of the two paper.js objects returned on getIntersections; must have
        * property point.
        * @return {String} An enum string that indicates the state of the point.
        * @static
        */
        getMidPointStatus: function getMidPointStatus( shape, intersection1, intersection2 ) {
            var point1 = intersection1.point,
                point2 = intersection2.point,
                UtilsClass = MathInteractives.Common.Utilities.Models.Utils,
                midPoint = UtilsClass.getMidPoint( point1, point2 ),
                modelNamespace = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData;
            if ( modelNamespace.isPointOnPath( midPoint, shape ) ) {
                return modelNamespace.POINT_STATUS.IS_ON_PATH;
            }
            else if ( modelNamespace.isPointInsideShape( shape, midPoint ) ) {
                return modelNamespace.POINT_STATUS.IS_INSIDE;
            }
            return modelNamespace.POINT_STATUS.IS_OUTSIDE;
        },

        /**
        * Checks and returns if the passed point is inside the polygonal shape passed.
        *
        * @method isPointInsideShape
        * @param shape {Object} Paper.js object of the polygon.
        * @param point {Object} The point that needs to be tested.
        * @return {Boolean} True, if the point is inside the shape.
        * @static
        */
        isPointInsideShape: function isPointInsideShape( shape, point, isCallFromOverlapCheck ) {
            var segments,
                segment1, segment2,
                outerChild, innerChild,
                isInside = false,
                isInsideInner = false,
                isInsideOuter = false,
                numberOfVertices,
                modelNamespace = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData;
            if ( shape.children ) {
                if ( isCallFromOverlapCheck === true ) {
                    for ( var m = 0; m < shape.children.length; m++ ) {
                        if ( modelNamespace.isPointInsideShape( shape.children[m], point ) ) return true;
                    }
                    return false;
                }
                else {
                    outerChild = shape.children[0];
                    innerChild = shape.children[1];
                    return ( !( modelNamespace.isPointInsideShape( innerChild, point ) ) && modelNamespace.isPointInsideShape( outerChild, point ) );
                }
            }
            segments = shape.segments;
            numberOfVertices = segments.length;
            for ( var i = -1, j = numberOfVertices - 1; ++i < numberOfVertices; j = i ) {
                segment1 = segments[i];
                segment2 = segments[j];
                ( ( segment1.point.y <= point.y && point.y < segment2.point.y ) || ( segment2.point.y <= point.y && point.y < segment1.point.y ) )
                && ( point.x < ( segment2.point.x - segment1.point.x ) * ( point.y - segment1.point.y ) / ( segment2.point.y - segment1.point.y ) + segment1.point.x )
                && ( isInside = !isInside );
            }
            return isInside;
        },

        /**
        * Checks and returns if the passed point lies on one of the passed polygon's sides.
        *
        * @method isPointOnPath
        * @param point {Object} The point that needs to be tested.
        * @param shape {Object} Paper.js object of the polygon.
        * @return {Boolean} True, if the point is on one of the shape's sides.
        * @static
        */
        isPointOnPath: function isPointOnPath( point, path ) {
            var segments, segmentsLength,
                outerChild, innerChild,
                point1, point2,
                xDiff, yDiff,
                UtilsClass,
                distance, distance1, distance2,
                modelNamespace = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData;
            if ( path.children ) {
                outerChild = path.children[0];
                innerChild = path.children[1];
                return ( modelNamespace.isPointOnPath( point, outerChild ) || modelNamespace.isPointOnPath( point, innerChild ) );
            }
            UtilsClass = MathInteractives.Common.Utilities.Models.Utils;
            segments = path.segments;
            segmentsLength = segments.length;
            for ( var i = 0; i < segmentsLength - 1; i++ ) {
                point1 = segments[i].point;
                distance1 = UtilsClass.getPointDistance( point, point1 );
                point2 = segments[( i + 1 ) % segmentsLength].point;
                if ( point1.x !== point2.x || point1.y !== point2.y ) {
                    distance = UtilsClass.getPointDistance( point1, point2 );
                    distance2 = UtilsClass.getPointDistance( point, point2 );
                    //(y1 - y2) * (x1 - x3) == (y1 - y3) * (x1 - x2)
                    if ( distance1 + distance2 === distance ) {
                        return true;
                    }
                }
            }
            return false;
        },

        /**
        * Checks if the label will fit in the shape at given location.
        *
        * @method positionAndCheckBlock
        * @param labelRect {Object} Paper.js rectanglular object of label's size.
        * @param shape {Object} Paper.js object of the shape.
        * @param x {Number} The x co-ordinate of the location to be checked.
        * @param y {Number} The y co-ordinate of the location to be checked.
        * @return {Object} Object containing two booleans one each for label and its icon. The boolean will be true if the label/mark can
        * be placed at the given location.
        * @private
        */
        positionAndCheckBlock: function positionAndCheckBlock( labelRect, shape, x, y, paperscope ) {
            labelRect.position = { x: x, y: y };
            var intersections = labelRect.getIntersections( shape ),
                returnObj,
                iconRect,
                iconHeight,
                validForLabel = false,
                validForIcon = false,
                modelNamespace = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData;
            if ( intersections.length === 0 && shape.contains( labelRect.position ) ) {
                validForLabel = true;
            }
            else {
                iconHeight = labelRect.bounds.height;
                iconRect = new paperscope.Path.Rectangle( {
                    point: [0, 0],
                    size: [iconHeight, iconHeight]
                } );
                iconRect.position = { x: x, y: y };
                intersections = iconRect.getIntersections( shape );
                if ( intersections.length === 0 && shape.contains( iconRect.position ) ) {
                    validForIcon = true;
                }
                iconRect.remove();
            }
            returnObj = {
                isValidForLabel: validForLabel,
                isValidForIcon: validForIcon
            }
            return returnObj;
        },

        handleIntersectionCase: function handleIntersectionCase( data ) {
            var topIntersections = data.topIntersections,
                bottomIntersections = data.bottomIntersections,
                intersectionsCase = topIntersections.length + '' + bottomIntersections.length,
                shape = data.shape,
                labelRect = data.labelRect,
                UtilsClass = MathInteractives.Common.Utilities.Models.Utils,
                centroid = data.centroid,
                y = data.y,
                paperscope = data.paperscope,
                intersections = topIntersections.concat( bottomIntersections ),
                topIntersectionsCount, bottomIntersectionsCount,
                intersectionsMidPointsStatus = [],
                tempArr1, tempArr2,
                modelNamespace = MathInteractives.Common.Interactivities.ShapeDecomposition.Models.ShapeDecompositionData;
            switch ( intersectionsCase ) {
                case '22':
                    if ( intersections[0].point.x >= intersections[3].point.x ||
                        intersections[1].point.x <= intersections[2].point.x ||
                        intersections[0].point.x === intersections[1].point.x ||
                        intersections[2].point.x === intersections[3].point.x ) {
                        return {
                            validPointForLabel: false,
                            validPointForIcon: false
                        }
                    }
                    intersections.sort( modelNamespace.sortHorizontalIntersections );
                    var gridStepSize = modelNamespace.GAP_BETWEEN_POINTS,
                        minX, maxX,
                        cols, index,
                        cellToCheckX, x,
                        checkResult,
                        validPoint = false, validPointForIcon = false,
                        checkResultDistance, validPointDistance;
                    // consider only the inner two intersections
                    minX = Math.ceil(( intersections[1].point.x - modelNamespace.GRID_START_X ) / gridStepSize ) * gridStepSize + modelNamespace.GRID_START_X;
                    maxX = Math.floor(( intersections[2].point.x - modelNamespace.GRID_START_X ) / gridStepSize ) * gridStepSize + modelNamespace.GRID_START_X;
                    if ( maxX - minX < labelRect.bounds.width ) {
                        validPoint = false;
                        if ( maxX - minX >= gridStepSize ) {
                            validPointForIcon = { x: ( minX + maxX ) / 2, y: y };
                        }
                    }
                    else {
                        //cols = ( maxX - minX ) / gridStepSize;
                        //cellToCheckX = minX + gridStepSize / 2;
                        //for ( index = 0; index < cols; index++ ) {
                        //    x = cellToCheckX + gridStepSize * index;
                        //    checkResult = this._positionAndCheckBlock( labelRect, shape, x, y );
                        //    if ( checkResult.isValidForLabel ) {
                        //        if ( validPoint ) {
                        //            checkResultDistance = UtilsClass.getPointDistance( centroid, { x: x, y: y } );
                        //            if ( checkResultDistance < validPointDistance ) {
                        //                validPoint = { x: x, y: y };
                        //                validPointDistance = checkResultDistance;
                        //            }
                        //        }
                        //        else {
                        //            validPoint = { x: x, y: y };
                        //            validPointDistance = UtilsClass.getPointDistance( centroid, validPoint );
                        //        }
                        //    }
                        //}
                        checkResult = modelNamespace.positionAndCheckBlock( labelRect, shape, ( minX + maxX ) / 2, y, paperscope );
                        if ( checkResult.isValidForLabel ) {
                            validPoint = { x: ( minX + maxX ) / 2, y: y };
                        }
                    }
                    return {
                        validPointForLabel: validPoint,
                        validPointForIcon: validPointForIcon
                    };
                    break;
                case '23':
                    // \   in   /      ____/ in \            / in \      / in \____       / in \
                    //  \  /\  /      /          \     /\___/      \     /          \     /      \___/\
                    intersectionsMidPointsStatus[0] = modelNamespace.getMidPointStatus( shape, bottomIntersections[0], bottomIntersections[1] );
                    intersectionsMidPointsStatus[1] = modelNamespace.getMidPointStatus( shape, bottomIntersections[1], bottomIntersections[2] );

                    // if mid point of first two bottom intersection points & the last two both lie inside,
                    //      then, ignore the middle bottom intersection point
                    if ( intersectionsMidPointsStatus[0] === 'isInside' && intersectionsMidPointsStatus[1] === 'isInside' ) {
                        bottomIntersections[1] = bottomIntersections[2];
                        bottomIntersections.length = 2;
                    }
                        // if mid point of the first two bottom intersection points lies outside or on the path,
                        //  (assuming this mean that the mid point of the last two points lies inside)
                        //      then, ignore the first bottom intersection point
                    else if ( intersectionsMidPointsStatus[0] !== 'isInside' ) {
                        bottomIntersections.shift( 1 );
                    }
                        // else (i.e. when the mid point of the last two bottom intersection points lies outside or
                        //  on the path)
                        //  (assuming this mean that the mid point of the first two points lies inside)
                        //      ignore the last bottom intersection point
                    else {
                        bottomIntersections.pop();
                    }
                    return modelNamespace.handleIntersectionCase( {
                        shape: shape,
                        topIntersections: topIntersections,
                        bottomIntersections: bottomIntersections,
                        labelRect: labelRect,
                        centroid: centroid,
                        y: y,
                        paperscope: paperscope
                    } );
                    break;
                case '32':
                    //                                      ___                                         ____
                    // \   \/   /       \____      /      \/   \      /        \      ____/     \      /    \/
                    //  \  in  /             \ in /             \ in /          \ in /           \ in /
                    intersectionsMidPointsStatus[0] = modelNamespace.getMidPointStatus( shape, topIntersections[0], topIntersections[1] );
                    intersectionsMidPointsStatus[1] = modelNamespace.getMidPointStatus( shape, topIntersections[1], topIntersections[2] );

                    // if mid point of first two top intersection points & the last two both lie inside,
                    //      then, ignore the middle top intersection point
                    if ( intersectionsMidPointsStatus[0] === 'isInside' && intersectionsMidPointsStatus[1] === 'isInside' ) {
                        topIntersections[1] = topIntersections[2];
                        topIntersections.length = 2;
                    }
                        // if mid point of the first two top intersection points lies outside or on the path,
                        //  (assuming this mean that the mid point of the last two points lies inside)
                        //      then, ignore the first top intersection point
                    else if ( intersectionsMidPointsStatus[0] !== 'isInside' ) {
                        topIntersections.shift( 1 );
                    }
                        // else (i.e. when the mid point of the last two top intersection points lies outside or on
                        //  the path)
                        //  (assuming this mean that the mid point of the first two points lies inside)
                        //      ignore the last top intersection point
                    else {
                        topIntersections.pop();
                    }
                    return modelNamespace.handleIntersectionCase( {
                        shape: shape,
                        topIntersections: topIntersections,
                        bottomIntersections: bottomIntersections,
                        labelRect: labelRect,
                        centroid: centroid,
                        y: y,
                        paperscope: paperscope
                    } );
                    break;
                case '24':
                    //   ___    / in \       / in ___ in \        / in \    ___
                    //  /   \__/      \     /    /   \    \      /      \__/   \
                    // if mid point of first two bottom intersection points lies on the shape,
                    //  ignore the first two bottom intersection points
                    if ( modelNamespace.getMidPointStatus( shape, bottomIntersections[0], bottomIntersections[1] ) === 'isOnPath' ) {
                        bottomIntersections.splice( 0, 2 );
                    }
                        // if mid point of next two bottom intersection points lies on the shape,
                        //  ignore the two top intersection points
                    else if ( modelNamespace.getMidPointStatus( shape, bottomIntersections[1], bottomIntersections[2] ) === 'isOnPath' ) {
                        bottomIntersections.splice( 1, 2 );
                    }
                    else {// i.e. when mid point of last two bottom intersection points lies on the shape
                        // ignore the last two points
                        bottomIntersections.splice( 2, 2 );
                    }
                    return modelNamespace.handleIntersectionCase( {
                        shape: shape,
                        topIntersections: topIntersections,
                        bottomIntersections: bottomIntersections,
                        labelRect: labelRect,
                        centroid: centroid,
                        y: y,
                        paperscope: paperscope
                    } );
                    break;
                case '42':
                    //  \     __        /                          \        __    /
                    //   \___/  \      /       /   \___/   \        \      /  \__/
                    //           \ in /       /      in     \        \ in /
                    // if mid point of first two top intersection points lies on the shape,
                    //  ignore the first two top intersection points
                    if ( modelNamespace.getMidPointStatus( shape, topIntersections[0], topIntersections[1] ) === 'isOnPath' ) {
                        topIntersections.splice( 0, 2 );
                    }
                        // if mid point of next two top intersection points lies on the shape,
                        //  ignore the two top intersection points
                    else if ( modelNamespace.getMidPointStatus( shape, topIntersections[1], topIntersections[2] ) === 'isOnPath' ) {
                        topIntersections.splice( 1, 2 );
                    }
                    else {// i.e. when mid point of last two top intersection points lies on the shape
                        // ignore the last two points
                        topIntersections.splice( 2, 2 );
                    }
                    return modelNamespace.handleIntersectionCase( {
                        shape: shape,
                        topIntersections: topIntersections,
                        bottomIntersections: bottomIntersections,
                        labelRect: labelRect,
                        centroid: centroid,
                        y: y,
                        paperscope: paperscope
                    } );
                    break;
                case '44':
                    // divide into two intersection cases of (2,2)
                    // and return the closest answer
                    tempArr1 = [topIntersections[0], topIntersections[1]];
                    tempArr2 = [bottomIntersections[0], bottomIntersections[1]];
                    checkResult = modelNamespace.handleIntersectionCase( {
                        shape: shape,
                        topIntersections: tempArr1,
                        bottomIntersections: tempArr2,
                        labelRect: labelRect,
                        centroid: centroid,
                        y: y,
                        paperscope: paperscope
                    } );
                    if ( checkResult && checkResult.validPointForLabel ) {
                        validPoint = checkResult.validPointForLabel;
                    }
                    if ( checkResult && checkResult.validPointForIcon ) {
                        validPointForIcon = checkResult.validPointForIcon;
                    }
                    topIntersectionsCount = topIntersections.length;
                    bottomIntersectionsCount = bottomIntersections.length;
                    tempArr1 = [topIntersections[topIntersectionsCount - 2], topIntersections[topIntersectionsCount - 1]];
                    tempArr2 = [bottomIntersections[bottomIntersectionsCount - 2], bottomIntersections[bottomIntersectionsCount - 1]];
                    checkResult = modelNamespace.handleIntersectionCase( {
                        shape: shape,
                        topIntersections: tempArr1,
                        bottomIntersections: tempArr2,
                        labelRect: labelRect,
                        centroid: centroid,
                        y: y,
                        paperscope: paperscope
                    } );
                    if ( checkResult ) {
                        if ( checkResult.validPointForLabel ) {
                            if ( validPoint ) {
                                if ( UtilsClass.getPointDistance( centroid, checkResult.validPointForLabel ) <
                                    UtilsClass.getPointDistance( centroid, validPoint ) ) {
                                    validPoint = checkResult.validPointForLabel;
                                }
                            }
                            else {
                                validPoint = checkResult.validPointForLabel;
                            }
                        }
                        if ( checkResult.validPointForIcon ) {
                            if ( validPointForIcon ) {
                                if ( UtilsClass.getPointDistance( centroid, checkResult.validPointForIcon ) <
                                    UtilsClass.getPointDistance( centroid, validPointForIcon ) ) {
                                    validPointForIcon = checkResult.validPointForIcon;
                                }
                            }
                            else {
                                validPointForIcon = checkResult.validPointForIcon;
                            }
                        }
                    }
                    return {
                        validPointForLabel: validPoint,
                        validPointForIcon: validPointForIcon
                    };
                    break;
                case '33':
                    intersectionsMidPointsStatus[0] = modelNamespace.getMidPointStatus( shape, topIntersections[0], topIntersections[1] );
                    intersectionsMidPointsStatus[1] = modelNamespace.getMidPointStatus( shape, topIntersections[1], topIntersections[2] );
                    intersectionsMidPointsStatus[2] = modelNamespace.getMidPointStatus( shape, bottomIntersections[0], bottomIntersections[1] );
                    intersectionsMidPointsStatus[3] = modelNamespace.getMidPointStatus( shape, bottomIntersections[1], bottomIntersections[2] );
                    //    _____/    /
                    //   /  in  ___/
                    //   \     /
                    if ( intersectionsMidPointsStatus[0] !== 'isOutside' && intersectionsMidPointsStatus[1] !== 'isOutside' &&
                        intersectionsMidPointsStatus[2] !== 'isOutside' && intersectionsMidPointsStatus[3] !== 'isOutside' ) {
                        topIntersections.splice( 1, 1 );
                        bottomIntersections.splice( 1, 1 );
                    }
                    else {
                        //                                                         /  \
                        // if first intersection point is a lone peak           /\/ in \
                        // then repeat the first intersection point            /        \
                        if ( intersectionsMidPointsStatus[0] === 'isOutside' &&
                            intersectionsMidPointsStatus[1] !== 'isOutside' &&
                            intersectionsMidPointsStatus[2] !== 'isOutside' &&
                            intersectionsMidPointsStatus[3] !== 'isOutside' ) {
                            topIntersections.shift();
                            bottomIntersections.shift();
                        }
                            //                                                         /  \
                            // if last intersection point is a lone peak              / in \/\
                            // then repeat the last intersection point               /        \
                        else if ( intersectionsMidPointsStatus[1] === 'isOutside' &&
                            intersectionsMidPointsStatus[0] !== 'isOutside' &&
                            intersectionsMidPointsStatus[2] !== 'isOutside' &&
                            intersectionsMidPointsStatus[3] !== 'isOutside' ) {
                            topIntersections.pop();
                            bottomIntersections.pop();
                        }
                            //
                            // if first intersection point is a lone peak
                            // then repeat the first intersection point
                        else if ( intersectionsMidPointsStatus[2] === 'isOutside' &&
                            intersectionsMidPointsStatus[3] !== 'isOutside' &&
                            intersectionsMidPointsStatus[0] !== 'isOutside' &&
                            intersectionsMidPointsStatus[1] !== 'isOutside' ) {
                            topIntersections.shift();
                            bottomIntersections.shift();
                        }
                            //
                            // if last intersection point is a lone peak
                            // then repeat the last intersection point
                        else if ( intersectionsMidPointsStatus[3] === 'isOutside' &&
                            intersectionsMidPointsStatus[2] !== 'isOutside' &&
                            intersectionsMidPointsStatus[0] !== 'isOutside' &&
                            intersectionsMidPointsStatus[1] !== 'isOutside' ) {
                            topIntersections.pop();
                            bottomIntersections.pop();
                        }
                    }
                    return modelNamespace.handleIntersectionCase( {
                        intersectionsCase: topIntersections.length + '' + bottomIntersections.length,
                        shape: shape,
                        topIntersections: topIntersections,
                        bottomIntersections: bottomIntersections,
                        labelRect: labelRect,
                        centroid: centroid,
                        y: y,
                        paperscope: paperscope
                    } );
                    break;
                case '34':
                    intersectionsMidPointsStatus[0] = modelNamespace.getMidPointStatus( shape, topIntersections[0], topIntersections[1] );
                    intersectionsMidPointsStatus[1] = modelNamespace.getMidPointStatus( shape, topIntersections[1], topIntersections[2] );
                    //                                                         \            /
                    // if the 2nd intersection point is a lone peak             \ in /\ in /
                    // then repeat the second intersection point                 \  /  \  /
                    if ( intersectionsMidPointsStatus[0] === 'isInside' &&
                        intersectionsMidPointsStatus[1] === 'isInside' ) {
                        topIntersections.splice( 1, 0, topIntersections[1] );
                    }
                    else {
                        //                                                              /  \
                        // if first intersection point is a lone peak           /\ out / in \
                        // then repeat the first intersection point            /  \   /      \
                        if ( intersectionsMidPointsStatus[0] === 'isOutside' ) {
                            topIntersections.shift();
                            bottomIntersections.shift();
                            bottomIntersections.shift();
                        }
                            //                                                         /  \
                            // if last intersection point is a lone peak              / in \ out /\
                            // then repeat the last intersection point               /      \   /  \
                        else if ( intersectionsMidPointsStatus[1] === 'isOutside' ) {
                            topIntersections.pop();
                            bottomIntersections.splice( 2 );
                        }
                    }
                    return modelNamespace.handleIntersectionCase( {
                        intersectionsCase: topIntersections.length + '' + bottomIntersections.length,
                        shape: shape,
                        topIntersections: topIntersections,
                        bottomIntersections: bottomIntersections,
                        labelRect: labelRect,
                        centroid: centroid,
                        y: y,
                        paperscope: paperscope
                    } );
                    break;
                case '43':
                    intersectionsMidPointsStatus[0] = modelNamespace.getMidPointStatus( shape, bottomIntersections[0], bottomIntersections[1] );
                    intersectionsMidPointsStatus[1] = modelNamespace.getMidPointStatus( shape, bottomIntersections[1], bottomIntersections[2] );
                    //                                                           /  \  /  \
                    // if the 2nd intersection point is a lone pit bottom       / in \/ in \
                    // then repeat the second intersection point               /            \
                    if ( intersectionsMidPointsStatus[0] === 'isInside' &&
                        intersectionsMidPointsStatus[1] === 'isInside' ) {
                        bottomIntersections.splice( 1, 0, bottomIntersections[1] );
                    }
                    else {
                        //                                                     \  /   \      /
                        // if first intersection point is a lone pit bottom     \/ out \ in /
                        // then repeat the first intersection point                     \  /
                        if ( intersectionsMidPointsStatus[0] === 'isOutside' ) {
                            bottomIntersections.shift();
                            topIntersections.shift();
                            topIntersections.shift();
                        }
                            //                                                     \      /   \  /
                            // if last intersection point is a lone pit             \ in / out \/
                            // then repeat the last intersection point               \  /
                        else if ( intersectionsMidPointsStatus[1] === 'isOutside' ) {
                            bottomIntersections.pop();
                            topIntersections.splice( 2 );
                        }
                    }
                    return modelNamespace.handleIntersectionCase( {
                        intersectionsCase: topIntersections.length + '' + bottomIntersections.length,
                        shape: shape,
                        topIntersections: topIntersections,
                        bottomIntersections: bottomIntersections,
                        labelRect: labelRect,
                        centroid: centroid,
                        y: y,
                        paperscope: paperscope
                    } );
                    break;
                default:
                    break;
            }
            return false;
        },

        EVENTS: {
            /**
            * Fired when user goes from one tab to another i.e. on Next, Done, Restart buttons click.
            *
            * @event CHANGE_DIRECTION_TEXT
            * @param directionTextNumber {String} Number indicating the direction text view to be displayed.
            * @static
            */
            CHANGE_DIRECTION_TEXT: 'change-direction-text',

            /**
            * Fired when user clicks on try another button.
            *
            * @event TRY_ANOTHER_CLICK
            * @static
            */
            TRY_ANOTHER_CLICK: 'try-another-click',

            /**
            * Fired when user clicks on done button.
            *
            * @event DONE_BUTTON_CLICK
            * @static
            */
            DONE_BUTTON_CLICK: 'done-button-click',

            /**
            * Fired when user clicks on next button.
            *
            * @event NEXT_BUTTON_CLICK
            * @static
            */
            NEXT_BUTTON_CLICK: 'next-button-click',

            /**
            * Fired when user clicks on check button.
            *
            * @event CHECK_BUTTON_CLICK
            * @static
            */
            CHECK_BUTTON_CLICK: 'check-button-click',

            /**
            * Fired when the table needs to be updated on some user action.
            *
            * @event TABLE_DATA_EVENT
            * @param actionId {String} The action enum for which the table needs to be updated.
            * @param [eventData] {Object} Additional data for updating the table depending on the causing action.
            * @param [eventData.paperItem] {Object} Paper.js object of the shape on which the action was performed or of
            * the shape whose row-entry is to be updated in the table.
            * @param [eventData.shapes] {Array} An array of paper.js objects for all shapes on the canvas, required when
            * all the row entries are to be updated.
            * @param [eventData.undoneStep] {Object} Data from the undo stack about the last step undone.
            * @static
            */
            TABLE_DATA_EVENT: 'table-data-event',

            /**
            * Fired when a button needs to be hidden or made visible.
            *
            * @event HIDE_BUTTON
            * @param buttonName {String} The button whose visibility is to be toggled.
            * @param bool {Boolean} True if the button is to be hidden, else false.
            * @static
            */
            HIDE_BUTTON: 'hide-button',

            /**
            * Fired when a button needs to be disabled or enabled.
            *
            * @event DISABLE_BUTTON
            * @param buttonName {String} The button whose state is to be toggled.
            * @param bool {Boolean} True if the button is to be disabled, else false.
            * @static
            */
            DISABLE_BUTTON: 'disable-button',

            /**
            * Fired on focus and blur of input box.
            *
            * @event CHANGE_SHAPE_BORDER_COLOR
            * @param shapeCode {String} The code of the shape to identify it.
            * @param isOriginal {Boolean} A boolean indicating if the shape is original or a copy.
            * @param showEditBorder {Boolean} A boolean indicating if the purple border is to be shown or removed.
            * @static
            */
            CHANGE_SHAPE_BORDER_COLOR: 'change-shape-border-color',

            /**
            * Fired when a label is to be added to or removed from a shape.
            *
            * @event ADD_REMOVE_SHAPE_LABEL
            * @param isLabelToBeAdded {Boolean} True, if label is to be added. Else, false.
            * @param [options] {Object} Data required to add or remove the shape's label.
            * @param [options.shape] {Object} Paper.js object of the shape, required if the label is to be added.
            * @param [options.inputValue] {String} The input as entered by the user, required if the label is to be added.
            * @param [options.correctLabel] {Boolean} True, if a green label for correct input is to be displayed; else,
            * false. Required if the label is to be added.
            * @param [options.shapeCode] {String} The shape's unique code if it is to be removed.
            * @param [options.isOriginal] {Boolean} A boolean indicating if the shape is a copy or is original. Required if
            * the shape is to be removed.
            * @static
            */
            ADD_REMOVE_SHAPE_LABEL: 'add-remove-shape-label'
        },

        ACTION_ENUM: {
            TRANSLATE: 'translate',
            ROTATE: 'rotate',
            REFLECT: 'reflect',
            COPY: 'copy',
            CUT: 'cut',
            UNDO: 'undo',
            CHECK: 'check',
            DONE: 'done',
            TRY_ANOTHER: 'try-another',
            CUT_LINE: 'cut-line',
            REMOVE_ALL_BADGES: 'remove-all-badges'
        },

        SHAPE_TYPES: {
            ACTUAL: 'actual',
            DUPLICATE: 'duplicate'
        },

        SHAPE_STROKE_COLORS: {
            NORMAL: '#224C5C',      // From Tab_6.jpg
            COPY: '#4A4A4A',        // From Tab_6.jpg
            SELECTED: '#ad00bd',    // From Tab_6.jpg; During input box edit
            INCORRECT: '#DD0000',   // From Tab_7.jpg
            CORRECT: '#48B800'      // From Tab_8.jpg
        },

        POINT_STATUS: {
            IS_INSIDE: 'isInside',
            IS_ON_PATH: 'isOnPath',
            IS_OUTSIDE: 'isOutside'
        },

        MIN_X_FOR_RESIZE: 181,
        MAX_X_FOR_RESIZE: 421,
        MIN_Y_FOR_RESIZE: 133,
        MAX_Y_FOR_RESIZE: 373,
        GAP_BETWEEN_POINTS: 24,
        NUMBER_OF_X_POINTS: 25,
        NUMBER_OF_Y_POINTS: 21,
        GRID_START_X: 13,
        GRID_START_Y: 13,
        MINI_SHAPE_MAX_IMAGE_HEIGHT: 26,
        MINI_SHAPE_MAX_IMAGE_WIDTH: 74, // 2 * (10px padding)
        BOUNDING_BOX_LEFT: 13,
        BOUNDING_BOX_RIGHT: 589,
        BOUNDING_BOX_TOP: 13,
        BOUNDING_BOX_BOTTOM: 469,

        LABEL_URL: {
            CORRECT: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCMjk3MThBN0FBOTgxMUU0QjI3MjkzODJDMEE4RTM1QSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCMjk3MThBOEFBOTgxMUU0QjI3MjkzODJDMEE4RTM1QSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkIyOTcxOEE1QUE5ODExRTRCMjcyOTM4MkMwQThFMzVBIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkIyOTcxOEE2QUE5ODExRTRCMjcyOTM4MkMwQThFMzVBIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+EH+ZKgAAAg1JREFUeNpi/P//PwMWIA/EEUDsBcQqQCwCxG+A+C4QbwXiFUD8EF0TI8gwxiXGYM7/mLOcQKr1w6/PORseH2Dd8OQAA5ANV2wgqMaQoOwLpNV/A7lTgbgaqPcbVC/CMCBHFCi2E2iIYcKxeoaPv78w4AL+sg4MCywbGATYeM8Due5A/a/hhgEBGxAfWnB3s3ni8QYGYgA/Kw/DAbdZIFeeBHLtgfgnE1SuE+giog0CAZDLE441gILBHMjtgIWZHChgFdb7sDz8+pyBVFCvl8bQoJf+B8hUBbksCeg9og3SB0YCCMPAhOvLQBQLECeCDHM58PIM0QYdcJ0FxsjevfD+JojpCjJM6QGaq0BOBwUwNoOAMchQcKYHRe7DL3DMq4MME0aWiFfyAYUBOKZgBiIbBEo2C+9tweZwIZBhb5FFQAqBYQiKcrCBoDRFhEEg8A5k2D0HcWMUUVASgRm4wb6XoEEGkAi5CTJsb4KSL4YCmIEggM8ge6BDQJYBwW54OgNqYMGmARReF9/fwhnD+4FBAPQZPJ09AuIpE0xKUNIPDOAzCBTr0CACZfoHKHkTlDUcdqfhNQAt5YOYqHkTmOt/ASlfUClwwXs5WKE8tyTOEgPkNahBoFLDF6j/J7byjAtItQNxFiiLgFI2NEHCYw0a2KAwmgbElRjlGRagAC1pvYFYGUdJ+wBdE0CAAQCHwfZbxC575wAAAABJRU5ErkJggg==',
            INCORRECT: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpBMjM3RjZGN0FBOTgxMUU0ODU2QzlCREIwN0JCMzQyMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpBMjM3RjZGOEFBOTgxMUU0ODU2QzlCREIwN0JCMzQyMSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkEyMzdGNkY1QUE5ODExRTQ4NTZDOUJEQjA3QkIzNDIxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkEyMzdGNkY2QUE5ODExRTQ4NTZDOUJEQjA3QkIzNDIxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+lZUhcwAAAidJREFUeNqUVDtoFFEUPZFVcKdTE7u4uyoWfsDGIBaiJOgqglspaKMpFEwsIggSsfCDRkhCogEbOwUFYQWRIPEDFobYBD+NRdZol0StdgJxhec57806uzszuDlwZubN3Hvm3fPefS3GGMRgA3mcPERuIteRP8gZ8jn5iPzWmNRixfIFNxovrub1Bny/B++mVmJyCij7YfTGLNC1H8hlKxyNkf3MXQxya8TGi6189YICOzE4CviLSMTuXcCF84DnTXN0gPkLoRiwinyLidcdGLqDpuClgdvXNUtOH3vJpRXBpwHOqHkhQTO3FfgdHN3SK4m1kz24dx/LRmkWKD6DzQcyEjvN8lKYX6gP7OulxUOuHCGXAZ48ADr31cc9tWIp8pTEOvHxc/yfc1nniwzX3fPiyy191VOXFHOYm48GVf3TVrhyyT3Lo5dvorFu+2zRzNYmeqJ9VoV+WDuOYo3EfsaXmHF7yRrNMta3BaWmk8R+SayEHduin1SaPFJp5/rARXIenumOxqozgC/y7BV92YOHj+sDrt50s5l8H3qoUt3qhdi+tbowE+qAdtvAg6OpWHP/h4FrYGV/+LRZZX4n7+Jst/NpOThxDIFFavrZ+t5Ua1y87HZ2M0IndUqhoTfzhd+8HrGnwNiwC2xrTT4xVJoTmrZ5+cKS/aaZmYNHHY1JkyNkxQgzJWM+fApZLpsAlSAuXZP77whqRCY4aQ9r4RNO2ogXfwUYADO65RBqd5UIAAAAAElFTkSuQmCC'
        }
    } );
} )();
