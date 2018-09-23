(function () {
    'use strict';

    /**
    * A wrapper around highcharts
    *
    * @class Graph   
    * @extends Backbone.Model
    * @namespace MathInteractives.Common.Components.Models
    */
    MathInteractives.Common.Components.Models.Graph = Backbone.Model.extend({
        defaults: {
            /*chart related options*/
            /**
            * Holds type of chart
            * @attribute chartType
            * @type String
            * @default 'scatter'
            */
            chartType: 'scatter',
            /**
            * Holds enable or disable state of chart credits
            * @attribute chartCredits
            * @type Boolean
            * @default false
            */
            chartCredits: false,
            /**
            * Holds height of chart
            * @attribute chartHeight
            * @type Number
            * @default null
            */
            chartHeight: null,
            /**
            * Holds width of chart
            * @attribute chartWidth
            * @type Number
            * @default null
            */
            chartWidth: null,
            /**
            * Holds indicator for animation
            * @attribute animation
            * @type Boolean
            * @default false
            */
            animation: false,
            /**
            * 
            * @attribute zoomType
            * @type String
            * @default null
            */
            zoomType: null,
            /**
            * Holds border color
            * @attribute borderColor
            * @type String 
            * @default '#C9C9C9'
            */
            borderColor: '#C9C9C9',
            /**
            * Holds radius of border
            * @attribute borderRadius
            * @type Number
            * @default 0
            */
            borderRadius: 0,
            /**
            * Holds width of border
            * @attribute borderWidth
            * @type Number 
            * @default 2
            */
            borderWidth: 2,
            /**
            * Holds margin from bottom
            * @attribute marginBottom
            * @type Number 
            * @default 50
            */
            marginBottom: 50,
            /**
            * Holds margin from left
            * @attribute marginLeft
            * @type Number 
            * @default 50
            */
            marginLeft: 50,
            /**
            * Holds margin from right
            * @attribute marginRight
            * @type Number 
            * @default 50
            */
            marginRight: 50,
            /**
            * Holds margin from top
            * @attribute marginTop
            * @type Number 
            * @default 50
            */
            marginTop: 50,
            /*chart related options ends*/

            /*title related options*/
            /**
            * Holds chart title
            * @attribute chartTitle
            * @type String 
            * @default 'New title'
            */
            chartTitle: 'New title',
            /**
            * Holds plot border width
            * @attribute plotBorderWidth
            * @type Number 
            * @default 1
            */
            plotBorderWidth: 1,
            /*title related options ends*/


            /*grid related options*/
            /**
            * holds indicator for showing grid 
            * @attribute showGrid
            * @type Boolean 
            * @default true
            */
            showGrid: true,
            /**
            * holds thikness of grid line
            * @attribute gridLineThickness
            * @type Number 
            * @default 2
            */
            gridLineThickness: 2,
            /**
            * holds color of grid line
            * @attribute gridLineColor
            * @type String 
            * @default '#AAAAAA'
            */
            gridLineColor: '#AAAAAA',
            /**
            * holds minimun value of x axis
            * @attribute xMin
            * @type Number 
            * @default 0
            */
            xMin: 0,
            /**
            * holds minimun value of y axis
            * @attribute yMin
            * @type Number 
            * @default 0
            */
            yMin: 0,
            /**
            * holds maximum value of x axis
            * @attribute xMax
            * @type Number 
            * @default 10
            */
            xMax: 10,
            /**
            * holds maximum value of y axis
            * @attribute yMax
            * @type Number 
            * @default 10
            */
            yMax: 10,
            /*grid related options end*/

            /*x-axis related options*/
            /**
            * holds x-axis line width
            * @attribute xAxisLineWidth
            * @type Number 
            * @default 3
            */
            xAxisLineWidth: 3,
            /**
            * holds x-axis line color
            * @attribute xAxislineColor
            * @type String 
            * @default '#606060'
            */
            xAxislineColor: '#606060',
            /**
            * holds x-axis line title
            * @attribute xTitle
            * @type String 
            * @default 'x-axis title'
            */
            xTitle: 'x-axis title',
            /**
            * holds x-axis tick length
            * @attribute xTickLength
            * @type Number 
            * @default 0
            */
            xTickLength: 0,
            /**
            * holds x-axis labels x coordinate
            * @attribute xLabelPositionX
            * @type Number 
            * @default 0
            */
            xLabelPositionX: 0,
            /**
            * holds x-axis labels y coordinate
            * @attribute xLabelPositionY
            * @type Number 
            * @default 24.5
            */
            xLabelPositionY: 24.5,
            /**
            * holds x-axis tick interval
            * @attribute xTickInterval
            * @type Number 
            * @default 1
            */
            xTickInterval: 1,
            /**
            * holds x-axis title offset
            * @attribute xTitleOffset
            * @type Number 
            * @default 35
            */
            xTitleOffset: 35,
            /**
            * 
            * @attribute xUseHTML
            * @type Boolean 
            * @default 35
            */
            xUseHTML: true,
            /**
            * 
            * @attribute xFormatter
            * @type String 
            * @default null
            */
            xFormatter: null,
            /**
            * holds x-axis label styling parameter
            * @attribute xAxisLabelStyle
            * @type Object 
            * @default {color: '#777777',fontSize: '16px',fontFamily: 'Arial',fill: '#777777'}
            */
            xAxisLabelStyle: {
                color: '#777777',
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: '#777777'
            },
            /**
            * 
            * @attribute xAxisTitleUseHTML
            * @type Boolean 
            * @default false
            */
            xAxisTitleUseHTML: false,
            /*x-axis related options end*/

            /*y-axis related options*/
            /**
            * holds y-axis line width 
            * @attribute yAxisLineWidth
            * @type Number 
            * @default 3
            */
            yAxisLineWidth: 3,
            /**
            * holds y-axis line color 
            * @attribute yAxislineColor
            * @type String 
            * @default '#606060'
            */
            yAxislineColor: '#606060',
            /**
            * holds y-axis title
            * @attribute yTitle
            * @type String 
            * @default 'y-axis title'
            */
            yTitle: 'y-axis title',
            /**
            * holds y-axis tick length
            * @attribute yTickLength
            * @type Number 
            * @default 0
            */
            yTickLength: 0,
            /**
            * holds y-axis labels x coordinate
            * @attribute yLabelPositionX
            * @type Number 
            * @default -12.5
            */
            yLabelPositionX: -12.5,
            /**
            * holds y-axis labels y coordinate
            * @attribute yLabelPositionY
            * @type Number 
            * @default 5
            */
            yLabelPositionY: 5,
            /**
            * holds y-axis tick interval
            * @attribute yTickInterval
            * @type Number 
            * @default 2
            */
            yTickInterval: 2,
            /**
            * holds y-axis tick offset
            * @attribute yTitleOffset
            * @type Number 
            * @default 30
            */
            yTitleOffset: 30,
            /**
            * 
            * @attribute yUseHTML
            * @type Boolean 
            * @default false
            */
            yUseHTML: false,
            /**
            * 
            * @attribute yFormatter
            * @type String 
            * @default null
            */
            yFormatter: null,
            /**
            * holds y-axis labels styling parameters
            * @attribute yAxisLabelStyle
            * @type Number 
            * @default { color: '#777777',fontSize: '16px',fontFamily: 'Arial',fill: '#777777'}
            */
            yAxisLabelStyle: {
                color: '#777777',
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: '#777777'
            },
            /*y-axis related options end*/

            /*tooltip related options*/
            /**
            * 
            * @attribute toolTipFormatter
            * @type String 
            * @default null
            */
            toolTipFormatter: null,
            /**
            * 
            * @attribute toolTipUseHTML
            * @type Boolean 
            * @default false
            */
            toolTipUseHTML: false,
            /**
            * holds indicator for tooltip
            * @attribute toolTipEnabled
            * @type Boolean 
            * @default true
            */
            toolTipEnabled: true,
            /**
            * holds delay for hiding tooltip
            * @attribute toolTipHideDelay
            * @type Number   
            * @default -1
            */
            toolTipHideDelay: -1,
            /**
            * holds styling parameter for tooltip
            * @attribute tooltipStyle
            * @type Object   
            * @default {fontSize: '13px',fontFamily: 'Arial',color: '#000000'}
            */
            tooltipStyle: {
                fontSize: '13px',
                fontFamily: 'Arial',
                color: '#000000'
            },
            /**
            * holds indicator fo hiding animation of tootip
            * @attribute toolTipHideAnimation
            * @type Boolean   
            * @default false
            */
            toolTipHideAnimation: false,
            /**
            * holds tooltip border color
            * @attribute toolTipBorderColor
            * @type String
            * @default null
            */
            toolTipBorderColor: null,
            /*tooltip related options end*/

            /**
            * 
            * @attribute plotOptHover
            * @type Boolean 
            * @default false
            */
            plotOptHover: false,
            /**
            * holds plot line animation indicator
            * @attribute plotLineAnimation
            * @type boolean 
            * @default false
            */
            plotLineAnimation: false,
            /**
            * holds plot count
            * @attribute plotCount
            * @type Number 
            * @default 1
            */
            plotCount: 1,
            /**
            * holds plot count id prefix
            * @attribute plotCountIdprefix
            * @type String 
            * @default 'plit_'
            */
            plotCountIdPrefix: 'plot_',
            /**
            * 
            * @attribute series
            * @type Object 
            * @default empty array
            */
            series: []
        },

        /**
        * @namespace MathInteractives.Common.Components.Models
        * @class Graph 
        * @constructor
        */
        initialize: function () {
            var graphHeight, graphWidth, self;

            self = this;

            this.manageHeightWidth('height');
            this.manageHeightWidth('width');

            this.on('change:chartHeight', function () {
                self.manageHeightWidth('height');
            });
            this.on('change:chartWidth', function () {
                self.manageHeightWidth('width');
            });

            return;
        },

        /**
        * Manages characters height and width
        * @method manageHeightWidth
        * @public
        * @param bManageWidth {String} what is need to be manage    
        */
        manageHeightWidth: function (bManageWidth) {
            var graphWidth, graphHeight;

            switch (bManageWidth) {
                case 'height':
                    graphHeight = this.get('chartHeight') ? this.get('chartHeight') + this.get('marginTop') + this.get('marginBottom') : this.get('chartHeight');
                    this.set('chartHeight', graphHeight);
                    break;

                case 'width':
                    graphWidth = this.get('chartWidth') ? this.get('chartWidth') + this.get('marginLeft') + this.get('marginRight') : this.get('chartWidth');
                    this.set('chartWidth', graphWidth);
                    break;
            }
        },

        /**
        * Add new plot in chart(graph)
        * @method addPlot
        * @public
        * @param plotPointData {Object} data of new point that going to be add
        * @param markerModel {Object} marker object whit its parameter
        * @return {String} new added point id
        */
        addPlot: function (plotPointData, markerModel) {
            var originalSeries, newPlot, className, model, plotCount, plotURL;
            model = this;

            if (!markerModel) {
                markerModel = new MathInteractives.Common.Components.Models.Graph.Marker();
            }

            plotCount = model.get('plotCount');

            className = MathInteractives.Common.Components.Models.Graph;
            newPlot = {};
            newPlot.id = model.get('plotCountIdPrefix') + plotCount;
            model.set('plotCount', plotCount + 1, { silent: true });
            newPlot.color = markerModel.get('lineColor') ? markerModel.get('lineColor') : className.LINE_COLOR,
            newPlot.lineWidth = markerModel.get('lineWidth') || markerModel.get('lineWidth') === 0 ? markerModel.get('lineWidth') : className.LINE_WIDTH,
            newPlot.data = plotPointData;
            //newPlot.data.events = model.getGraphEventHandlers();
            newPlot.marker = {};
            newPlot.marker.lineWidth = markerModel.get('pointLineWidth') ? markerModel.get('pointLineWidth') : className.POINT_LINE_WIDTH;
            newPlot.marker.radius = markerModel.get('pointRadius') ? markerModel.get('pointRadius') : className.POINT_RADIUS;
            newPlot.marker.fillColor = markerModel.get('pointFillColor');
            plotURL = 'url(' + (markerModel.get('pointSymbol') ? markerModel.get('pointSymbol') : className.POINT_FILL_URL) + ')';
            newPlot.marker.symbol = markerModel.get('useImageInSymbol') ? plotURL : markerModel.get('pointSymbol');
            newPlot.marker.states = {};
            newPlot.marker.states.hover = {};
            newPlot.marker.states.hover.enabled = false;
            newPlot.showInLegend = false;
            newPlot.dashStyle = markerModel.get('dashStyle') ? markerModel.get('dashStyle') : className.LINE_TYPES.CONTINUES_THIN_LINE

            newPlot['toolTipText'] = markerModel.get('toolTipText') || {};  // allows different tooltip formatters to be used for different series

            originalSeries = _.clone(model.get('series'));
            originalSeries.push(newPlot);

            model.set('series', originalSeries);

            //console.log(newPlot.id);
            return (newPlot.id);
            //return originalSeries;
        },

        /**
        * Gets marker data of respective polt
        * @method getMarkerData
        * @public
        * @param plotId {String} id of plot
        * @param eventName {String} name of event occur
        * @return {Object} marker data object
        */
        getMarkerData: function (plotId, eventName) {
            var i, series, len, markerData, propertyName;
            markerData = null;

            switch (eventName) {
                case 'mouseOver':
                    propertyName = 'mouseOverMarker'
                    break;
                case 'mouseOut':
                    propertyName = 'mouseOutMarker';
                    break;
            }

            series = this.get('series');
            len = series.length;
            for (i = 0; i < len; i++) {
                if (plotId === series[i].id) {
                    markerData = series[i][propertyName];
                }
            }

            return markerData;
        },

        /**
        * Add marker data associated with event in series attribute
        * @method addMarkerForEvents
        * @public        
        * @param eventName {String} name of event occur
        * @param markerData {Object} marker data of plot with id = plotId
        * @param plotId {String} id of plot        
        */
        addMarkerForEvents: function (eventname, markerData, plotId) {
            var propertyName, i, len, series, markerDataObj,
                 className, plotURL;

            className = MathInteractives.Common.Components.Models.Graph;

            if (!markerData) {
                return;
            }

            switch (eventname) {
                case 'mouseOver':
                    propertyName = 'mouseOverMarker'
                    break;
                case 'mouseOut':
                    propertyName = 'mouseOutMarker';
                    break;
            }
            // find plot and attach property

            markerDataObj = {};
            markerDataObj.lineWidth = markerData.get('pointLineWidth') ? markerData.get('pointLineWidth') : className.POINT_LINE_WIDTH;
            markerDataObj.radius = markerData.get('pointRadius') ? markerData.get('pointRadius') : className.POINT_RADIUS;
            markerDataObj.fillColor = markerData.get('pointFillColor');
            plotURL = 'url(' + (markerData.get('pointSymbol') ? markerData.get('pointSymbol') : className.POINT_FILL_URL) + ')';
            markerDataObj.symbol = markerData.get('useImageInSymbol') ? plotURL : markerData.get('pointSymbol');
            markerDataObj.states = {};
            markerDataObj.states.hover = {};
            markerDataObj.states.hover.enabled = false;
            series = this.get('series');
            len = series.length;
            for (i = 0; i < len; i++) {
                if (plotId === series[i].id) {
                    series[i][propertyName] = markerDataObj;
                    this.set('series', series, { silent: true });
                }
            }

        },

        /**
        * Add point in plot of chart passed
        * @method addPoint
        * @public        
        * @param chart {Object} model of chart in which new point to be added
        * @param point {Object} point data
        * @param plotId {String} id of plot        
        */
        addPoint: function (chart, point, plotId) {
            var series, length, i, plot;

            series = chart.get(plotId);
            series.addPoint(point);

            // silently add that point in the model
            series = this.get('series');
            length = series.length;
            for (i = 0; i < length; i++) {
                if (series[i].id === plotId) {
                    series[i].push(point);
                }
            }

            return;
        },

        /**
        * Removes all plot from chart, set series attribute to empty array
        * @method removeAllPlot
        * @public      
        */

        removeAllPlot: function () {
            this.set('series', []);
            return;
        }
    }, {
        /**
        * holds image url for point 
        * @property POINT_FILL_URL
        * @static
        * @type String 
        * @default 'common/media/image/dragItems/Drag-Handle_up.png'
        */
        POINT_FILL_URL: 'common/media/image/dragItems/Drag-Handle_up.png',
        /**
        * holds image url for point mouse hover
        * @property POINT_FILL_URL_MOUSE_OVER
        * @static
        * @type String 
        * @default 'common/media/image/dragItems/Drag-Handle_Over.png'
        */
        POINT_FILL_URL_MOUSE_OVER: 'common/media/image/dragItems/Drag-Handle_Over.png',
        /**
        * holds width of point line 
        * @property POINT_LINE_WIDTH
        * @static
        * @type Number 
        * @default 0
        */
        POINT_LINE_WIDTH: 0,
        /**
        * holds radius of point
        * @property POINT_RADIUS
        * @static
        * @type Number 
        * @default 9
        */
        POINT_RADIUS: 9,
        /**
        * holds color of line
        * @property LINE_COLOR
        * @static
        * @type String 
        * @default '#4c1787'
        */
        LINE_COLOR: '#4c1787',
        /**
        * holds width of line
        * @property LINE_WIDTH
        * @static
        * @type String 
        * @default '#4c1787'
        */
        LINE_WIDTH: 5,
        /**
        * holds types of lines
        * @property LINE_TYPES
        * @static
        * @type Object 
        * @default {CONTINUES_THIN_LINE: 'solid',DASHED_THIN_LINE: 'dash'}
        */
        LINE_TYPES: {
            CONTINUES_THIN_LINE: 'solid',
            DASHED_THIN_LINE: 'dash'
        },
        /**
        * holds some predefine shapes
        * @property PREDEFINED_SHAPES
        * @static
        * @type Object        
        */
        PREDEFINED_SHAPES: {
            CIRCLE: 'circle',
            SQUARE: 'square',
            TRIANGLE: 'triangle',
            DIAMOND: 'diamond',
            TRIANGLE_DOWN: 'triangle-down'
        },
        /**
        * holds model of marker
        * @property Marker
        * @static
        * @type Object        
        */
        Marker: Backbone.Model.extend({
            defaults: {
                lineColor: null,
                lineWidth: null,
                pointFillColor: null,
                pointLineWidth: null,
                pointRadius: null,
                pointSymbol: null,
                useImageInSymbol: true,
                dashStyle: null
            }
        })

    });

})();


