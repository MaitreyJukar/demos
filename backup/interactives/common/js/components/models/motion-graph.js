(function () {

    /**
    * Model for properties used in the 'Explore' tab
    *
    * @class ExploreMotion
    * @constructor
    * @extends MathInteractives.Common.Player.Models.BaseInteractive
    * @namespace MathInteractives.Interactivities.MotionDetector.Models
    **/
    MathInteractives.Common.Components.Models.MotionGraph = Backbone.Model.extend({
        defaults: {

            /**
            * Model object of title of the graph
            * @property title
            * @type Object
            * @default null
            */
            title: null,

            /**
            * Position of graph's origin in canvas in pixels. Example:- { x: 30, y: 470 }
            * @property origin
            * @type Object
            * @default null
            */
            origin: null,

            /**
            * Model object of X axis
            * @property xAxis
            * @type Object
            * @default
            */
            xAxis: null,

            /**
            * Model object of Y axis
            * @property yAxis
            * @type Object
            * @default
            */
            yAxis: null,

            /**
            * PlotLineCollection object - a collection of all plot models on the graph
            * @property plots
            * @type Object
            * @default []
            */
            plots: [],

            /**
            * Plot model object stored as a refernce for while dragging, to be deleted in case of valid drop on trash can
              and repainted in case of invalid drop
            * @property referencePlot
            * @type Object
            * @default null
            */
            referencePlot: null,

            /**
            * Model object of point to be repainted
            * @property plotToRepaint
            * @type Object
            * @default null
            */
            plotToRepaint: null,

            paintReferencePlotFlag: null,

            player: null,
            manager: null,
            idPrefix: null,
            path: null,

            MotionGraphClass: this,

            /**
            * Boolean to draw or not end points of lines on graph everytime it is repainted.
            * @property paintWithEndPoints
            * @type Boolean
            * @default false
            */
            paintWithEndPoints: false,

            /**
            * Boolean to show/hide controls on setting up the graph
            * @property showControlOnInit
            * @type Boolean
            * @default false
            */
            showControlOnInit: false,

            /**
            * Boolean to allow/disallow dragging of lines, points on the graph.
            * @property allowDrawing
            * @type Boolean
            * @default false
            */
            allowDrawing: false,

            tickLength: 0,      // never defined
            repaintIndicator: 0,// never used
            canvasHeight: 100,  // never used
            canvasWidth: 100,   // never used

            /**
            * The color of x-axis
            * @property xAxisStrokeColor
            * @type String
            * @default null
            */
            xAxisStrokeColor: null,

            /**
            * The color of y-axis
            * @property yAxisStrokeColor
            * @type String
            * @default null
            */
            yAxisStrokeColor: null,

            /**
            * The distance measured horizontally in pixels between each grid line in the canvas
            * @property xAxisStepSize
            * @type Number
            * @default null
            */
            xAxisStepSize: null,

            /**
            * The distance measured vertically in pixels between each grid line in the canvas
            * @property yAxisStepSize
            * @type Number
            * @default null
            */
            yAxisStepSize: null,

            /**
            * Length of vertical grid lines
            * @property verticalLineSize
            * @type Number
            * @default null
            */
            verticalLineSize: null,

            /**
            * Length of horizontal grid lines
            * @property horizontalLineSize
            * @type Number
            * @default null
            */
            horizontalLineSize: null,

            /**
            * One step on x or y axis equals these many units. If value equals 5, then graph displays steps as 0, 5, 10, ...
            * @property unitsPerStepsize
            * @type Number
            * @default 5
            */
            unitsPerStepsize: 5,

            /**
            * One step on x-axis equals these many units. If value equals 5, then graph displays steps as 0, 5, 10, ...
            * @property xUnitsPerStepsize
            * @type Number
            * @default null
            */
            xUnitsPerStepsize: null,

            /**
            * One step on y-axis equals these many units. If value equals 5, then graph displays steps as 0, 5, 10, ...
            * @property yUnitsPerStepsize
            * @type Number
            * @default null
            */
            yUnitsPerStepsize: null,

            /**
            * String to be appended just after the idPrefix for creating two graphs in an interactivity
            * @property prependID
            * @type String
            * @default null
            */
            prependID: null,

            /**
            * Boolean to allow creation of control buttons like draw-line, drag-line, user-graph, feedback-graph, clear-all
            * @property showControls
            * @type Boolean
            * @default false
            */
            showControls: null,

            /**
            * Trash can position object storing x & y position of trash can. Default set in view from its static part.
            * @property trashCanCustomPosition
            * @type Object
            * @default null
            */
            trashCanCustomPosition: null,

            /**
            * Boolean to hide/show trash can raster; Set to true to hide the trash can raster.
            * @property hideRaster
            * @type Boolean
            * @default false
            */
            hideRaster: false,

            /**
            * Sets the 'max' property of the y-Axis model
            * @property defaultVerticalLine
            * @type Number
            * @default 20
            */
            defaultVerticalLine: 20,

            /**
            * Sets the 'max' property of the x-Axis model
            * @property defaultHorizontalLine
            * @type Number
            * @default 30
            */
            defaultHorizontalLine: 30,

            /**
            * Color of numbers shown on axis at each step
            * @property stepValueColor
            * @type String
            * @default '#777777'
            */
            stepValueColor: '#777777',//null,

            /**
            * Boolean to show/hide control buttons; used in view.
            * @property hideControlButtons
            * @type Boolean
            * @default false
            */
            hideControlButtons: false,

            toolTipText: null,

            /**
            * The horizontal distance by which the tooltip should be positioned away from mouse pointer.
            * @property toolTipXOffset
            * @type Number
            * @default 25
            */
            toolTipXOffset: null,
            /**
            * The vertical distance by which the tooltip should be positioned away from mouse pointer.
            * @property toolTipYOffset
            * @type Number
            * @default null
            */
            toolTipYOffset: null,

            /**
            * The precision by which the tooltip text must change. Example- 0.5, 0.25
            * @property toolTipTextPrecision
            * @type Number
            * @default 1
            */
            toolTipTextPrecision: null,

            /**
            * Object storing IDs of background-images each for left, middle and right div child of tooltip. Optional.
            May store string "none" if no background image is to be displayed.
            * @property toolTipBackGroundImageIds
            * @type Object
            * @default null
            */
            toolTipBackGroundImageIds: null,

            /**
            * Vertical distance of labels on x-axis from the x-axis
            * @property xLabelDistFromAxis
            * @type Number
            * @default null
            */
            xLabelDistFromAxis: null,

            /**
            * Horizontal distance of labels on y-axis from the y-axis
            * @property yLabelDistFromAxis
            * @type Number
            * @default null
            */
            yLabelDistFromAxis: null,

            /**
            * Vertical distance of labels on y-axis by which they must be pulled down to vertically align them to the grid
            * @property yLabelVerticalOffset
            * @type Number
            * @default null
            */
            yLabelVerticalOffset: null,

            /**
            * Sets the custom font style of axis step labels
            * @property characterStyle
            * @type Object
            * @default null
            */
            characterStyle: null,


            /**
            * Whether to show grid lines
            * @property showGridLines
            * @type Boolean
            * @default true
            */
            showGridLines: true,
            /**
            * Whether to show 0
            * @property ignoreZero
            * @type Boolean
            * @default false
            */
            ignoreZero: false
        },

        initialize: function () {
            var xUnitsPerStepsize = this.get('xUnitsPerStepsize'),
                unitsPerStepSize = null,
                yUnitsPerStepsize = this.get('yUnitsPerStepsize');

            this.setIDPrefix(this.get('idPrefix') + this.get('prependID'));
            if (this.get('showControls')) {
                this.set('showControls', this.get('showControls'))
            }

            var plots, oThis, title, xAxis, yAxis, origin;

            oThis = this;
            plots = this.get('plots').plots;

            // Title
            title = this.get('title');
            if (title) {
                this.set('title', new MathInteractives.Common.Components.Models.MotionGraph.Title(title));
            }
            else {
                this.set('title', new MathInteractives.Common.Components.Models.MotionGraph.Title());
            }

            // Axes
            xAxis = this.get('xAxis');
            if (xAxis) {
                this.set('xAxis', new MathInteractives.Common.Components.Models.MotionGraph.Axis(xAxis));
            }
            else {

                if (xUnitsPerStepsize !== null) {

                    unitsPerStepSize = xUnitsPerStepsize;
                } else {

                    unitsPerStepSize = this.get('unitsPerStepsize');
                }
                this.set('xAxis', new MathInteractives.Common.Components.Models.MotionGraph.Axis({
                    //labelText: 'Time Elapsed (s)',
                    stepSize: 48,
                    min: 0,
                    max: this.get('defaultHorizontalLine'),
                    unitsPerStepSize: unitsPerStepSize
                }));
            }

            yAxis = this.get('yAxis');
            if (yAxis) {
                this.set('yAxis', new MathInteractives.Common.Components.Models.MotionGraph.Axis(yAxis));
            }
            else {

                if (yUnitsPerStepsize !== null) {

                    unitsPerStepSize = yUnitsPerStepsize;
                } else {

                    unitsPerStepSize = this.get('unitsPerStepsize');
                }
                this.set('yAxis', new MathInteractives.Common.Components.Models.MotionGraph.Axis({
                    //labelText: 'Height (m)',
                    stepSize: 48,
                    min: 0,
                    max: this.get('defaultVerticalLine'),
                    unitsPerStepSize: unitsPerStepSize
                }));
            }

            // origin
            origin = this.get('origin');
            if (origin) {
                this.set('origin', new MathInteractives.Common.Components.Models.MotionGraph.Point(origin));
            }
            else {
                this.set('origin', new MathInteractives.Common.Components.Models.MotionGraph.Point({ x: 0, y: 0 }));
            }

            // plots collection
            plots = this.get('plots');
            plots = new MathInteractives.Common.Components.Models.MotionGraph.PlotLineCollection(plots);
            this.set('plots', plots);

            plots.on('add', function (plot) {
                oThis.set('plotToRepaint', plot);
            });

            plots.on('change', function (plot) {
                oThis.set('plotToRepaint', plot);
            });


        },

        setIDPrefix: function setIDPrefix(appendString) {
            if (appendString) {
                this.set('idPrefix', appendString);
            }
            return;
        },

        setReferencePlot: function (plot) {
            var plotToRemove, self;

            self = this;
            plotToRemove = this.get('referencePlot');

            if (plotToRemove && plotToRemove.paperPathObject) {
                plotToRemove.paperPathObject.remove();
                plotToRemove.get('points').off('add');
            }

            this.set('referencePlot', plot);

            if (plot) {
                plot.get('points').on('add', function (point) {
                    if (self.get('paintReferencePlotFlag')) {
                        self.set('plotToRepaint', plot);
                    }
                });
            }

            if (this.get('paintReferencePlotFlag')) {
                this.set('plotToRepaint', this.get('referencePlot'));
            }
        },

        setPaintReferencePlotFlag: function (set) {
            var referencePlot;
            this.set('paintReferencePlotFlag', set);
            referencePlot = this.get('referencePlot');

            if (set && referencePlot) {
                this.set('plotToRepaint', referencePlot);
            }
        },

        addPlot: function (plot) {
            var self = this;
            this.get('plots').add(plot);
            plot.get('points').on('add', function (point) {
                self.set('plotToRepaint', plot);
            });
            return;
        },

        clearGraph: function () {
            // destroy paper objects
            var count, allPlots, plotCount, paperObjects, i, j, plot,
                referencePlot;

            allPlots = this.get('plots');
            plotCount = allPlots.length;

            for (j = 0; j < plotCount; j++) {
                paperObjects = allPlots.at(j).paperPathObject;
                allPlots.at(j).paperEndPointCircleGroup.removeChildren();
                count = paperObjects.segments.length;

                // removing drawn objects
                for (i = count - 1; i >= 0; i--) {
                    paperObjects.segments[i].remove();
                }

                allPlots.at(j).get('points').reset();
            }
            this.set('plotToRepaint', null);
            this.set('plots', new MathInteractives.Common.Components.Models.MotionGraph.PlotLineCollection());

            // remove reference plot
            referencePlot = this.get('referencePlot');
            if (referencePlot && referencePlot.paperPathObject) {
                referencePlot.paperPathObject.remove();
            }

            if (referencePlot && referencePlot.paperEndPointCircleGroup) {
                referencePlot.paperEndPointCircleGroup.remove();
                referencePlot.get('points').reset();
            }


        },

        setOrigin: function (origin) {
            origin = new MathInteractives.Common.Components.Models.MotionGraph.Point(origin);
            this.set('origin', origin);
        },

        getSnappedPoint: function getSnappedPoint(point) {
            var snappedPoint, xDataPoint, yDataPoint,
                xStepSize, yStepSize, xMax, yMax, origin, pointRelativeToOrgin,
                xUnitsPerStepSize, yUnitsPerStepSize, xAxis, yAxis;

            snappedPoint = {};
            xAxis = this.get('xAxis');
            yAxis = this.get('yAxis');
            xStepSize = xAxis.get('stepSize');
            yStepSize = yAxis.get('stepSize');
            xMax = xAxis.get('max');
            yMax = yAxis.get('max');
            xUnitsPerStepSize = xAxis.get('unitsPerStepSize');
            yUnitsPerStepSize = yAxis.get('unitsPerStepSize');
            origin = this.get('origin');
            pointRelativeToOrgin = {};

            pointRelativeToOrgin.x = point.x - origin.get('x');
            pointRelativeToOrgin.y = origin.get('y') - point.y;

            xDataPoint = Math.round(pointRelativeToOrgin.x * (xUnitsPerStepSize / xStepSize));
            yDataPoint = Math.round(pointRelativeToOrgin.y * (yUnitsPerStepSize / yStepSize));

            snappedPoint.x = xDataPoint * (xStepSize / xUnitsPerStepSize) + origin.get('x');
            snappedPoint.y = origin.get('y') - yDataPoint * (yStepSize / yUnitsPerStepSize);

            return snappedPoint;
        }
    },
    {
        Title: Backbone.Model.extend({
            defaults: {
                content: "Height over Time",
                fillColor: '#6F2AAC',
                justification: 'center',
                fontSize: 18
            }
        }),

        Axis: Backbone.Model.extend({
            defaults: {
                labelText: 'Axis',
                labelColor: '#000000',
                labelJustification: 'center',
                labelFontSize: 15,
                stepSize: null,
                unitsPerStepSize: null,
                max: null
            }
        }),

        Point: Backbone.Model.extend({
            defaults: {
                x: 0,
                y: 0
            }
        }),

        PointCollection: Backbone.Collection.extend({
            model: this.Point,

            initialize: function () {
                this.model = MathInteractives.Common.Components.Models.MotionGraph.Point;
            }
        }),

        PlotLine: Backbone.Model.extend({
            defaults: {
                points: null,
                strokeColor: '#22B14C',
                strokeWidth: 1,
                lineType: null
            },

            initialize: function () {
                var oThis = this;
                oThis.set('points', new MathInteractives.Common.Components.Models.MotionGraph.PointCollection());
                oThis.set('lineType', MathInteractives.Common.Components.Models.MotionGraph.PlotLine.LINE_TYPES.CONTINUES_THIN_LINE);
            },

            addPoint: function (pointData) {
                var point;
                point = new MathInteractives.Common.Components.Models.MotionGraph.Point(pointData);
                this.get('points').add(point);
            }
        },
        {

            LINE_TYPES: {
                CONTINUES_THIN_LINE: 0,
                DASHED_THIN_LINE: 1
            }
        }),

        PlotLineCollection: Backbone.Collection.extend({
            model: this.PlotLine,

            initialize: function () {
                this.model = MathInteractives.Common.Components.Models.MotionGraph.PlotLine;
                this.paperPathObject = null;
            }
        })
    });
})();
