(function () {
    'use strict';

    /**
    * View for rendering Graph
    *
    * @class Graph
    * @constructor
    * @namespace MathInteractives.Common.Components.Views
    **/
    MathInteractives.Common.Components.Views.Graph = Backbone.View.extend({
        /**
        * Holds graph prameters
        * @property graphOptions
        * @type Object   
        * @default empty object    
        */
        graphOptions: {},

        markerOnMouseOver: null,

        markerOnMouseOut: null,

        /**
        * This method call bindEvents and render
        * @namespace MathInteractives.Common.Components.Views
        * @class Graph 
        * @constructor
        */
        initialize: function () {
            this.model.on('change', this.render, this);
            this.bindEvents();
            this.render();
        },

        /**
        * Renders graph data
        * @method render
        * @public
        */
        render: function () {
            var graphOptions;

            this.getGraphSetupOptions();
            graphOptions = this.graphOptions;
            this.$el.highcharts(graphOptions);

            // add new class for title
            this.doMiscellaneousWork();
        },

        /**
        * Bind events 
        * @method bindEvents
        * @public
        */
        bindEvents: function () {
            //this event handler is added to remove all the redundant nodes that highcharts adds inside the container
            // on window resize
            $(window).resize(function (event) { $('.highcharts-container').slice(1).remove() })
        },

        // this function is of no use now
        doMiscellaneousWork: function () {
            return;

            var chartTitleNode, axisContainerNode, axisTextNode,
                temp, oldClass, newClass, labelContainerNode, allLabels, len, i,
                label;

            // add class to chart-title
            chartTitleNode = this.$('.highcharts-title').find('tspan');
            chartTitleNode = $(chartTitleNode);

            oldClass = chartTitleNode.attr('class');
            newClass = oldClass ? oldClass + ' typography-header' : 'typography-header';
            chartTitleNode[0].setAttribute('class', newClass);

            // add class to axis title
            $('.highcharts-axis').each(function () {
                axisContainerNode = $(this);

                axisTextNode = axisContainerNode.find('tspan');

                oldClass = axisTextNode.attr('class');
                newClass = oldClass ? oldClass + ' typography-label' : 'typography-label';

                axisTextNode[0].setAttribute('class', newClass);

            });

            $('.highcharts-axis-labels').each(function () {
                labelContainerNode = $(this);

                allLabels = labelContainerNode.find('tspan');
                len = allLabels.length;

                for (i = 0; i < len; i++) {
                    label = allLabels[i];

                    oldClass = $(label).attr('class');
                    newClass = oldClass ? oldClass + ' typography-sub-header' : 'typography-sub-header';

                    label.setAttribute('class', newClass);
                }
            });
        },

        /**
        * This method get parameter for graph from model in graphOptions attribute
        * @method getGraphSetupOptions
        * @public
        */
        getGraphSetupOptions: function () {
            var model, graphOptions, xAxisOffset, yAxisOffset,
                marginBottom, marginTop, marginRight, marginLeft, containerWidth, containerHeight,
                tickIntervalWidth, viewObj;

            viewObj = this;
            model = this.model;
            graphOptions = this.graphOptions;

            marginBottom = model.get('marginBottom');
            marginTop = model.get('marginTop');
            marginRight = model.get('marginRight');
            marginLeft = model.get('marginLeft');

            containerWidth = this.$el.width();
            containerHeight = this.$el.height();

            yAxisOffset = containerWidth - marginRight - marginLeft;
            tickIntervalWidth = yAxisOffset / (model.get('xMax') - model.get('xMin'));
            yAxisOffset = tickIntervalWidth * Math.abs(model.get('xMin'));



            xAxisOffset = containerHeight - marginTop - marginBottom;
            tickIntervalWidth = xAxisOffset / (model.get('yMax') - model.get('yMin'));
            xAxisOffset = tickIntervalWidth * Math.abs(model.get('yMin'));

            graphOptions.chart = {
                type: model.get('chartType'),
                height: model.get('chartHeight'),
                width: model.get('chartWidth'),
                animation: false,
                showAxes: true,
                borderColor: '#C9C9C9',
                bordeRadius: 0,
                bordeWidth: 2,
                marginBottom: marginBottom,
                marginLeft: marginLeft,
                marginTop: marginTop,
                marginRight: marginRight,
                plotBorderWidth: model.get('plotBorderWidth')
            };

            graphOptions.title = {};
            graphOptions.title.text = model.get('chartTitle');
            graphOptions.title.style = {
                color: '#4c1787',
                'font-size': '18px',
                fontFamily: 'Montserrat, Arial, sans-serif',
                'font-weight': 'bold',
                fill: '#4c1787'
            }

            graphOptions.xAxis = {
                min: model.get('xMin'),
                max: model.get('xMax'),
                tickInterval: model.get('xTickInterval'),
                gridLineColor: model.get('gridLineColor'),
                gridLineWidth: model.get('gridLineThickness'),
                lineColor: model.get('xAxislineColor'),
                lineWidth: model.get('xAxisLineWidth'),
                tickLength: model.get('xTickLength'),
                offset: -xAxisOffset
            };

            graphOptions.xAxis.title = {};
            graphOptions.xAxis.title.useHTML = model.get('xAxisTitleUseHTML');
            graphOptions.xAxis.title.text = model.get('xTitle');
            graphOptions.xAxis.title.offset = model.get('xTitleOffset');
            graphOptions.xAxis.title.style = {
                color: '#222',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                fill: '#222'
            }
            

            graphOptions.xAxis.labels = {};
            graphOptions.xAxis.labels.align = 'center';
            graphOptions.xAxis.labels.x = model.get('xLabelPositionX');
            graphOptions.xAxis.labels.y = model.get('xLabelPositionY');
            graphOptions.xAxis.labels.style = model.get('xAxisLabelStyle');
            if (model.get(' ') !== null) {
                graphOptions.xAxis.labels.formatter = model.get('xFormatter');
            }
            graphOptions.xAxis.labels.useHTML = model.get('xUseHTML');
            
            graphOptions.yAxis = {
                min: model.get('yMin'),
                max: model.get('yMax'),
                tickInterval: model.get('yTickInterval'),
                gridLineColor: model.get('gridLineColor'),
                gridLineWidth: model.get('gridLineThickness'),
                lineColor: model.get('yAxislineColor'),
                lineWidth: model.get('yAxisLineWidth'),
                tickLength: model.get('yTickLength'),
                offset: -yAxisOffset
            };

            graphOptions.yAxis.title = {};
            graphOptions.yAxis.title.text = model.get('yTitle');
            graphOptions.yAxis.title.offset = model.get('yTitleOffset');
            graphOptions.yAxis.title.style = {
                color: '#222',
                'font-size': '16px',
                fontFamily: 'Arial, sans-serif',
                'font-weight': 'bold',
                fill: '#222'
            }

            graphOptions.yAxis.labels = {};
            graphOptions.yAxis.labels.align = 'right';
            graphOptions.yAxis.labels.x = model.get('yLabelPositionX');
            graphOptions.yAxis.labels.y = model.get('yLabelPositionY');
            graphOptions.yAxis.labels.style = model.get('yAxisLabelStyle');
            if (model.get('yFormatter') !== null) {
                graphOptions.yAxis.labels.formatter = model.get('yFormatter');
            }
            graphOptions.yAxis.labels.useHTML = model.get('yUseHTML');
            //tooltip

            graphOptions.tooltip = {};
            graphOptions.tooltip.animation = model.get('toolTipHideAnimation');
            graphOptions.tooltip.style = model.get('tooltipStyle');
            graphOptions.tooltip.enabled = model.get('toolTipEnabled');
            graphOptions.tooltip.useHTML = model.get('toolTipUseHTML'); 
            if (model.get('toolTipBorderColor') !== null) {
                graphOptions.tooltip.borderColor = model.get('toolTipBorderColor');
            }
            if (model.get('toolTipFormatter') !== null) {
                graphOptions.tooltip.formatter = model.get('toolTipFormatter');
            }
            else {
                graphOptions.tooltip.formatter = function () {
                    return model.get('xTitle') + ': ' + this.x + '<br/>' + model.get('yTitle') + ': ' + this.y;
                }
            }
            
            graphOptions.tooltip.hideDelay = model.get('toolTipHideDelay');
            
            
            graphOptions.series = model.get('series');
            graphOptions.credits = { enabled: model.get('chartCredits') };
            

            // plotOptions
            graphOptions.plotOptions = {};
            graphOptions.plotOptions.series = {};
            graphOptions.plotOptions.series.animation = model.get('plotLineAnimation');
            graphOptions.plotOptions.series.states = {};
            graphOptions.plotOptions.series.states.hover = {};
            graphOptions.plotOptions.series.states.hover.enabled = model.get('plotOptHover');
            graphOptions.plotOptions.series.point = {};
            
            graphOptions.plotOptions.series.point.events = {};
            graphOptions.plotOptions.series.point.events.mouseOver = function () {
                var markerData, plotId;
                plotId = this.series.userOptions.id;
                markerData = model.getMarkerData(plotId, 'mouseOver');
                if (!markerData) {
                    return;
                }
                this.update({
                    marker: markerData
                })
            }
            graphOptions.plotOptions.series.point.events.mouseOut = function () {
                var markerData, plotId;
                plotId = this.series.userOptions.id;
                markerData = model.getMarkerData(plotId, 'mouseOut');
                if (!markerData) {
                    return;
                }
                this.update({
                    marker: markerData
                })
            }
            
            /*
            var markerObj = new MathInteractives.Common.Components.Models.Graph.Marker({
                dashStyle: 'dash'
            })
            */
            //var chart = this.$el.highcharts();
            
            //graphOptions.series = model.addPlot([[1, 1], [4, 4]]);
            
            //model.addPoint(chart, [5, 5], 'plot_1')
            

            return;
        }
    })
})();