

(function () {
    'use strict';

    /**
    * Contains Data for grid and to render curves
    *
    * @class CurveGraph
    * @constructor
    * @namespace MathInteractives.Common.Components.Models.CurveGraph
    **/
    MathInteractives.Common.Components.Models.CurveGraph = Backbone.Model.extend({

        defaults: function () {
            return {

                /**
                * Stores ID prefix of the activity
                * @property idPrefix
                * @default null
                **/
                idPrefix: null,

                /**
                * Stores manager instance
                * @property manager
                * @default null
                **/
                manager: null,

                /**
                * Stores filepath 
                * @property filePath
                * @default null
                **/
                filePath: null,

                /**
                * Stores player instance
                * @property player
                * @default null
                **/
                player: null,

                /**
                * ID of the container div
                * @property containerId
                * @default null
                * @type String
                **/
                containerId: null,

                /**
                * ID of the canvas
                * @property canvasId
                * @default null
                * @type String
                **/
                canvasId: null,

                /**
                * Data related to grid
                * @property gridData
                * @type Object
                **/
                gridData: {
                    maxX: 10,
                    maxY: 10,
                    scaleX: 1,
                    scaleY: 1,
                },

                /**
                * Unit of x-axis quantity
                * @property xUnit
                * @default null
                * @type String
                **/
                xUnit: null,

                /**
                * Unit of y-axis quantity
                * @property yUnit
                * @default null
                * @type String
                **/
                yUnit: null,

                /**
                * Number of labels to skip on x-axis. Set to '1' for alternate
                * Displays all labels by default
                * @property skipXLabels
                * @default null
                * @type Number
                **/
                skipXLabels: 0,

                /**
                * Number of labels to skip on y-axis. Set to '1' for alternate
                * Displays all labels by default
                * @property skipYLabels
                * @default null
                * @type Number
                **/
                skipYLabels: 0,

                /**
                * Color of grid lines
                * @property gridLinesColor
                * @type String
                **/
                gridLinesColor: '#A8A8A8',

                /**
                * Color of grid background
                * @property gridBackgroundColor
                * @type String
                **/
                gridBackgroundColor: 'white',

                /**
                * Width of grid lines
                * @property gridLinesSize
                * @type Number
                **/
                gridLinesSize: 1,

                /**
                * Whether or not to show grid lines
                * @property showGridLines
                * @type Boolean
                **/
                showGridLines: true,

                /**
                * Padding between labels of y-axis and the grid
                * @property yLabelsPadding
                * @type Number
                **/
                yLabelsPadding: 10,

                /**
                * Adjustment to align labels vertically centered with lines
                * @property yLabelAdjustment
                * @type Number
                **/
                yLabelAdjustment: 5,

                /**
                * Padding between labels of x-axis and the grid
                * @property xLabelsPadding
                * @type Number
                **/
                xLabelsPadding: 18,

                /**
                * Padding of grid in the container
                * @property padding
                * @type Object
                **/
                padding: {
                    top: 50,
                    right: 20,
                    bottom: 20,
                    left: 40
                },

                /**
                * Default styling of the curve
                * @property defaultCurveStyle
                * @type Object
                **/
                defaultCurveStyle: {
                    strokeWidth: 2,
                    strokeColor: '#66CCFF'
                },

                /**
                * Default styling of the point
                * @property defaultPointStyle
                * @type Object
                **/
                defaultPointStyle: {
                    radius: 4
                },

                /**
                * Computed data related to rendering the grid
                * @property calculatedData
                * @type Object
                **/
                calculatedData: {
                    // Height of container and canvas
                    height: null,

                    // Width of container and canvas
                    width: null,

                    // Number of horizontal lines in grid
                    numOfHorizontalLines: null,

                    // Number of vertical lines in grid
                    numOfVerticalLines: null,

                    // Step size in pixels for x-axis
                    gridStepX: null,

                    // Step size in pixels for y-axis
                    gridStepY: null,

                    // Value of 1 x-axis unit of graph in pixels
                    xConversion: null,

                    // Value of 1 y-axis unit of graph in pixels
                    yConversion: null
                },

                xTooltipPrecision: null,

                yTooltipPrecision: null,

                tooltipZIndex: null,

                labelStyling: {
                    fontSize: 10,
                    isBold: false,
                    fontColor: '#222',
                    fontFamily: null
                },

                highlightPoints: true,
                allowClickOnGraphCurve: false,
                noOfPointsToShowOnCurve: 2,
                points: [],
                pixelPoints: [],
                clickablePointsStyling: {
                    radius: 10,
                    fillColor: '#004376'

                },
                clickablePointsCordsPrecision: 0,
                clickablePointsCordsStyling: {
                    fontSize: 12,
                    isBold: true,
                    fontColor: '#203a41',
                    fontFamily: 'montserrat'
                },
                showTooltip: true,
                filledPixelPoints: [],
                renderLineTicks: false,
                lineTickStyle: {
                    strokeWidth: 1,
                    color: '#A8A8A8'
                },
                gridMode: null,
                showTooltipOnCurve: false,
                pointSnapMode: 0,
                xAxisLabelFormat: null,
                yAxisLabelFormat: null,
                lineTickLength: 5,
                storkeWidthForTouchDevices: 30,
                isCustomEventBind: false,
                curveHoverColor: '#674c8',
                curveActiveColor: '#004376',
                allowHoverOnCurve: false,
                allowSmoothening: true
            }
        },

        /**
        * Returns the model
        *
        * @method initialize
        */
        initialize: function () {
            this._initializeDefaultProps();

            return;
        },

        /**
        * Calculates the data required for rendering curves/ points
        *
        * @method calculateConversionFactors
        */
        calculateConversionFactors: function (width, height) {
            var gridData = this.get('gridData'),
                padding = this.get('padding'),
                calculatedData = this.get('calculatedData');

            calculatedData.width = width;
            calculatedData.height = height;
            calculatedData.numOfHorizontalLines = gridData.maxY / gridData.scaleY;
            calculatedData.numOfVerticalLines = gridData.maxX / gridData.scaleX;

            calculatedData.gridStepX = (calculatedData.width - padding.left - padding.right) / calculatedData.numOfVerticalLines;
            calculatedData.gridStepY = (calculatedData.height - padding.top - padding.bottom) / calculatedData.numOfHorizontalLines;
            calculatedData.xConversion = calculatedData.gridStepX / gridData.scaleX;
            calculatedData.yConversion = calculatedData.gridStepY / gridData.scaleY;
        },

        /**
        * Calculates canvas coordinates of grid lines
        *
        * @method getGridLinesPoints
        * @return {Array} [linesPoints]
        */
        getGridLinesPoints: function () {
            var linesPoints = [],
                padding = this.get('padding'),
                gridData = this.get('gridData'),
                calculatedData = this.get('calculatedData'),
                left = null, top = null, i = 0;

            for (i = 0; i <= calculatedData.numOfVerticalLines; i++) {
                left = (i * calculatedData.gridStepX) + padding.left;

                linesPoints.push({
                    startPoint: { x: left, y: padding.top },
                    endPoint: { x: left, y: calculatedData.height - padding.bottom },
                    type: 'vertical',
                    value: gridData.scaleX * i
                });
            }

            for (i = 0; i <= calculatedData.numOfHorizontalLines; i++) {
                top = (i * calculatedData.gridStepY) + padding.top;

                linesPoints.push({
                    startPoint: { x: padding.left, y: top },
                    endPoint: { x: calculatedData.width - padding.right, y: top },
                    type: 'horizontal',
                    value: gridData.maxY - gridData.scaleY * i
                });
            }

            return linesPoints;
        },

        /**
        * Calculates canvas coordinates of grid boundary
        *
        * @method getGridOutlinePoints
        * @return {Array} [points]
        */
        getGridOutlinePoints: function () {
            var points = [],
                padding = this.get('padding'),
                calculatedData = this.get('calculatedData');

            points = [
            {
                startPoint: { x: padding.left, y: padding.top },
                endPoint: { x: calculatedData.width - padding.right, y: padding.top }
            },
            {
                startPoint: { x: calculatedData.width - padding.right, y: padding.top },
                endPoint: { x: calculatedData.width - padding.right, y: calculatedData.height - padding.bottom }
            },
            {
                startPoint: { x: calculatedData.width - padding.right, y: calculatedData.height - padding.bottom },
                endPoint: { x: padding.left, y: calculatedData.height - padding.bottom }
            },
            {
                startPoint: { x: padding.left, y: calculatedData.height - padding.bottom },
                endPoint: { x: padding.left, y: padding.top }
            }]

            return points;
        },

        /**
        * Computes pixel value of given grid point
        *
        * @method getPixelCoords
        * @param {Object} [point] {x: Number, y:Number}
        * @return {Object} [pixel]
        */
        getPixelCoords: function (point) {
            var calculatedData = this.get('calculatedData'),
                gridData = this.get('gridData'),
                padding = this.get('padding'),
                pixel = {};

            pixel.x = point.x * calculatedData.xConversion + padding.left;
            pixel.y = gridData.maxY * calculatedData.yConversion - point.y * calculatedData.yConversion + padding.top;

            return pixel;
        },
        /**
        * Computes graph x and y points from pixel point
        *
        * @method getGraphCoords
        * @param {Object} [pixelPoint] {x: Number, y:Number}
        * @return {Object} [point]
        */
        getGraphCoords: function getGraphCoords(pixelPoint) {
            var calculatedData = this.get('calculatedData'),
               gridData = this.get('gridData'),
               padding = this.get('padding'),
               pixelPosition = pixelPoint,
               coords = {};
            coords.x = (pixelPosition.x - padding.left) / calculatedData.xConversion;
            coords.y = ((gridData.maxY * calculatedData.yConversion) - pixelPosition.y + padding.top) / calculatedData.yConversion;
            return coords;
        },
        /**
        * Computes top and left of the tooltip
        *
        * @method getPixelCoords
        * @param {Object} [canvasCoords] {x: Number in pixels, y:Number in pixels} 
        * @param {Object} [$tooltip] jQuery object of tooltip div
        * @return {Object}
        */
        getTooltipPosition: function (canvasCoords, $tooltip) {
            var Model = MathInteractives.Common.Components.Models.CurveGraph,
                padding = this.get('padding'),
                calculatedData = this.get('calculatedData'),
                top = canvasCoords.y - ($tooltip.outerHeight() / 2) - Model.TOP_PADDING,
                left = canvasCoords.x + Model.LEFT_PADDING,
                tooltipRelativeLeft = calculatedData.width - left - $tooltip.outerWidth();

            if (top < padding.top) {
                top = padding.top;
            }

            if (tooltipRelativeLeft < 0) {
                left = left + tooltipRelativeLeft - padding.right - Model.LEFT_PADDING;
                top = top - ($tooltip.outerHeight() / 2);
            }

            return {
                top: top + 'px',
                left: left + 'px'
            }
        },
        generatePixelPointsArray: function generatePixelPointsArray() {
            var points = this.get('points'),
                numberOfPoints = points.length,
                pixelPoints = [];
            for (var i = 0; i < numberOfPoints; i++) {
                pixelPoints.push(this.getPixelCoords(points[i]));
            }
            this.set('pixelPoints', pixelPoints);
        },
        getNearestPixelPoint: function getNearestPixelPoint(pixelPoint) {
            var pixelPointArr = this.get('pixelPoints'),
                numberOfPixelPoints = pixelPointArr.length,
                nearestPixelPoint = pixelPointArr[0],
                smallestDistance = this.getDistance(pixelPointArr[0], pixelPoint);
            for (var i = 0; i < numberOfPixelPoints; i++) {
                var currentDistance = this.getDistance(pixelPointArr[i], pixelPoint);
                if (currentDistance < smallestDistance) {
                    smallestDistance = currentDistance;
                    nearestPixelPoint = pixelPointArr[i];
                    if (this.get('pointSnapMode') !== modelClass.POINT_SNAP_MODE.NEAREST_POINT) { //snaps to lower point on graph line which has slope greater or equal to 1
                        if (pixelPoint.x < nearestPixelPoint.x) {
                            nearestPixelPoint = pixelPointArr[i - 1];
                        }
                    }
                }
            }
            return nearestPixelPoint;
        },
        getDistance: function getDistance(point1, point2) {
            return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        },
        checkPointAlreadyPlaced: function checkPointAlreadyPlaced(pixelPoint) {
            var filledPixelPoints = this.get('filledPixelPoints'),
                numberOfFilledPixelPoints = filledPixelPoints.length,
                alreadyFilled = false;
            for (var i = 0; i < numberOfFilledPixelPoints; i++) {
                if (filledPixelPoints[i].x === pixelPoint.x && filledPixelPoints[i].y === pixelPoint.y) {
                    alreadyFilled = true;
                    break;
                }
            }
            return alreadyFilled;

        },
        _initializeDefaultProps: function _initializeDefaultProps() {
            var defaultLabelStyling = modelClass.LABEL_FORMAT.NORMAL;
            if (this.get('canvasId') === null) {
                this.set('canvasId', modelClass.DEFAULT_CANVAS_ID);
            }
            if (this.get('xAxisLabelFormat') === null) {
                this.set('xAxisLabelFormat', defaultLabelStyling);
            }
            if (this.get('yAxisLabelFormat') === null) {
                this.set('yAxisLabelFormat', defaultLabelStyling);
            }
        },
        getThousandRepresentation: function getThousandRepresentation(content) {
            var thousandRepresentation = modelClass.THOUSAND_REPRESENTATION;
            if (content > thousandRepresentation.MIN_THRESHOLD) {
                if (content % thousandRepresentation.CHECK_VAL === 0) {
                    content = content / thousandRepresentation.CHECK_VAL + thousandRepresentation.SYMBOL;
                }
                else {
                    content = (content / thousandRepresentation.CHECK_VAL).toFixed(thousandRepresentation.PRECISION) + thousandRepresentation.SYMBOL;
                }
            }
            return content;
        }


    }, {

        /**
        * Top padding of tooltip
        * 
        * @property TOP_PADDING
        * @type Number
        * @static
        */
        TOP_PADDING: 10,

        /**
        * Left padding of tooltip
        * 
        * @property LEFT_PADDING
        * @type Number
        * @static
        */
        LEFT_PADDING: 10,
        GRID_MODE: {
            GRID: 0,
            HORIZONTAL: 1,
            VERTICAL: 2
        },
        POINT_SNAP_MODE: {
            LOWER_POINT: 0,
            NEAREST_POINT: 1
        },
        DEFAULT_CANVAS_ID: 'graph-canvas',
        LABEL_FORMAT: {
            NORMAL: 0,
            THOUSAND_REPRESENTATION: 1
        },
        THOUSAND_REPRESENTATION: {
            MIN_THRESHOLD: 999,
            SYMBOL: 'k',
            CHECK_VAL: 1000,
            PRECISION: 1
        }

    });
    var modelClass = MathInteractives.Common.Components.Models.CurveGraph;
})();