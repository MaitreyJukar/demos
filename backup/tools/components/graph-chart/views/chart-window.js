/* globals _, $, window  */

(function(MathUtilities) {
    "use strict";
    /**
     * Provides the base class for graph-chart.
     *
     * @module MathUtilities.Components.GraphChart
     */
    MathUtilities.Components.GraphChart = {};

    /**
     * Provides a `Models` submodule for the base class GraphChart.
     *
     * @submodule MathUtilities.Components.GraphChart.Models
     */
    MathUtilities.Components.GraphChart.Models = {};
    /**
     * Provides a `Views` submodule for the base class GraphChart.
     *
     * @submodule MathUtilities.Components.GraphChart.Views
     */
    MathUtilities.Components.GraphChart.Views = {};
    /**
     * Provides a `templates` submodule for the base class GraphChart.
     *
     * @submodule MathUtilities.Components.GraphChart.templates
     */
    MathUtilities.Components.GraphChart.templates = {};
    /**
     * Provides the base class for graph-chart.
     *
     * @module MathUtilities.Components.GraphChart
     */

    /**
     * Creates a chart view.
     *
     * @class MathUtilities.Components.GraphChart.Views.ChartWindow
     * @extends Backbone.View
     * @constructor
     */
    MathUtilities.Components.GraphChart.Views.ChartWindow = Backbone.View.extend({
        /**
         * Holds the table's model object for this view.
         *
         * @property model
         * @default null
         * @type Object
         */
        "model": null,
        "$container": null,
        "chartName": null,
        "dropDownId": null,
        "spinnerView": null,
        "_equationPanel": null,
        "chartOptionsUpdated": false,
        "_supportedMulitpleCharts": ['pie', 'histogram', 'dot'],
        "initialize": function() {

            var chartOptionsData = {
                    "chartTitleSelected": true,
                    "chartTitle": null,
                    "chartAxesTitlesSelected": true,
                    "xAxisTitle": null,
                    "yAxisTitle": null,
                    "chartGridlinesSelected": true,
                    "chartLegendsSelected": true,
                    "chartAxesLinesSelected": true,
                    "chartAxesLabelsSelected": true,
                    "chartTable": null
                },
                chartName = this.options.chartName;

            this.chartName = chartName;
            this.$container = this.options.container;
            this.model = new MathUtilities.Components.GraphChart.Models.Chart({
                "chartOptionsData": chartOptionsData,
                "chartName": chartName,
                "accManager": this.options.accManagerView,
                "equationPanelView": this.options.equationPanelView
            });
            //create chart
            //calculate points in chart model
            //create highcharts object and draw chart from points in model
            this.model.on("chart-points-calculated", _.bind(function(obj, columnNo) {
                    this._sendChartPointsToTable(obj, columnNo);
                }, this))
                .on("histogram-calculation-error", _.bind(function(obj) {
                    this.$el.remove();
                    this.trigger("histogram-calculation-error");
                }, this))
                .on("box-calculation-error", _.bind(function(obj) {
                    this.trigger("box-calculation-error");
                }, this));
            this.off("best-fits-updated").on("best-fits-updated", _.bind(this._drawChart, this));
            this.startIndex = this.options.startIndex;
            this.accManagerView = this.options.accManagerView;
            this.equationPanelView = this.options.equationPanelView;
        },
        "events": {
            "click .chart-legend": "_showHideSeries",
            "mouseenter .chart-label-mathquill-container": "_mouseOverLabels",
            "mouseleave .chart-label-mathquill-container": "_mouseLeaveLabels",
            "mouseup .chart-options-button": '_mouseUpChartSettingBtn',
            "click .up-arrow": "_scrollLegendsToUp",
            "click .down-arrow": "_scrollLegendsToDown",
            "click .orientation-radio-btn .clickable-area.click-enabled": "_orientationRadioBtnClicked",
            "keydown .chart-window": "_loadScreenForChart",
            "focus .chart-close-button-container": "_closeOptionsOnCloseFocus",
            "click .spin-up-arrow, .spin-down-arrow": "_updateSpinnerAcc",
            "focusin .spin-up-arrow, .spin-down-arrow": "_setDefaultSpinnerAcc"
        },
        "_mouseUpChartSettingBtn": function(event) {
            $(event.target).removeClass('hovered');
        },
        "_attachHoverEffect": function(selector, mouseenterCallback, mouseleaveCallback) {
            if ($.support.touch) {
                var self = this,
                    TIMER = 400;

                this.$el.on("touchstart", selector,
                        function(event) {
                            clearTimeout(self._timerId);
                            self._timerId = setTimeout( //show tap and hold effect in touch devices
                                function() {
                                    mouseenterCallback.call(self, event);
                                }, TIMER);
                        })
                    .on("touchend", selector,
                        function(event) {
                            clearTimeout(self._timerId);
                            mouseleaveCallback.call(self, event);
                        });
            } else {
                this.$el.on("mouseenter", selector, _.bind(mouseenterCallback, this))
                    .on("mouseleave", selector, _.bind(mouseleaveCallback, this));
            }
        },

        "_detachHoverEffect": function(selector, mouseenterCallback, mouseleaveCallback) {
            if ($.support.touch) {
                $(selector).off("touchstart", mouseenterCallback)
                    .off("touchend", mouseleaveCallback);
            } else {
                $(selector).off("mouseenter", mouseenterCallback)
                    .off("mouseleave", mouseleaveCallback);
            }
        },

        "_scrollLegendsToUp": function(event) {
            var STEP = 150,
                $legendContainer;
            $legendContainer = this.$(".chart-box");
            $legendContainer.animate({
                    "scrollTop": "-=" + STEP + "px"
                },
                _.bind(this._showHideScrollArrows, this));

        },
        "_scrollLegendsToDown": function(event) {
            var STEP = 150,
                $legendContainer;
            $legendContainer = this.$(".chart-box");
            $legendContainer.animate({
                    "scrollTop": "+=" + STEP + "px"
                },
                _.bind(this._showHideScrollArrows, this));
        },

        "_showHideScrollArrows": function() {
            var $legendContainer = this.$(".chart-box"),
                currentScroll,
                scrollHeight = $legendContainer[0].scrollHeight - 1, //subtract padding from scroll height to avoid unnecessary scroll buttons
                containerHt = $legendContainer.height();
            currentScroll = $legendContainer.scrollTop();
            if (currentScroll === 0) {
                this.$(".up-arrow").hide();
            } else {
                this.$(".up-arrow").show();
            }
            if (currentScroll < scrollHeight - containerHt && scrollHeight > containerHt) {
                this.$(".down-arrow").show();
            } else {
                this.$(".down-arrow").hide();
            }
        },

        "_mouseLeaveLabels": function() {
            this.trigger("hide-tooltip");
        },

        "_mouseOverLabels": function(event) {
            var $target,
                $parent = $(event.target),
                BLUR_PADDING = 7,
                tooltipProperties;
            if ($parent.hasClass("chart-label-mathquill-container")) {
                $target = $parent.find(".chart-mathquill").first();
            } else {
                if ($parent.hasClass("chart-mathquill")) {
                    $target = $parent;
                } else {
                    if ($parent.hasClass("blur-hide")) {
                        $target = $parent.siblings(".chart-mathquill");
                    } else {
                        $target = $parent.parents(".chart-mathquill");
                    }
                }
                $parent = $parent.parents(".chart-label-mathquill-container");
            }
            tooltipProperties = {
                "element": $parent.parent(),
                "latex": $target.mathquill('latex'),
                "isLatex": true
            };

            $target.toggleClass("show-tooltip", $target.width() > $parent.width() - BLUR_PADDING || $target.height() > $parent.height());

            if ($target.hasClass("show-tooltip")) {
                this.trigger("show-tooltip", tooltipProperties);
            }
        },

        "_mouseOverLegend": function(event) {
            var $target = $(event.currentTarget),
                tooltipProperties,
                index,
                isLatex,
                highChart,
                loopVar,
                seriesId,
                dataLength,
                series,
                TEXTBOX_MARGIN = 6,
                latex,
                $mathquill = $target.find(".mathquill-rendered-math");

            if ($mathquill.length !== 0) {
                latex = $mathquill.mathquill("latex");
                isLatex = true;
            } else {
                latex = $target.find(".number-latex").html();
                if (typeof latex === "undefined") {
                    latex = "";
                }
                //html text converted to mathquill latex for tooltip
                latex = latex.replace("* 10<sup>", "\\cdot10^{");
                latex = latex.replace("</sup>", "}");
                isLatex = false;
            }
            $target.addClass("hovered");
            tooltipProperties = {
                "element": $target,
                "latex": latex,
                "isLatex": isLatex
            };
            if ($mathquill.width() > $mathquill.parents('.chart-text').width() - TEXTBOX_MARGIN) {
                this.trigger("show-tooltip", tooltipProperties);
            }
            if ($target.hasClass("deselected")) {
                return void 0;
            }
            index = Number($target.attr("index-data"));
            highChart = this.$(".charts").highcharts();
            switch (this.chartName) {
                case "pie":
                    series = highChart.series[0];
                    series.data[index].setState("hover");
                    break;
                case "box":
                    seriesId = $target.attr("series-id");
                    if (seriesId) {
                        series = highChart.get(seriesId);
                        series.update({
                            "lineWidth": 3
                        });
                    }
                    break;
                case "dot":
                    break;
                default:
                    series = highChart.series[index];
                    if ($target.attr("series-id")) {
                        series.update({
                            "lineWidth": 3
                        });
                    } else {
                        dataLength = series.data.length;
                        for (loopVar = 0; loopVar < dataLength; loopVar++) {
                            series.data[loopVar].setState("hover");
                        }
                    }
                    break;
            }
        },
        "_mouseLeaveLegend": function(event) {
            var $target = $(event.currentTarget),
                index,
                seriesId,
                highChart,
                dataLength,
                loopVar,
                series;

            $target.removeClass("hovered");
            this.trigger("hide-tooltip");
            if ($target.hasClass("deselected")) {
                return void 0;
            }
            index = Number($target.attr("index-data"));
            highChart = this.$(".charts").highcharts();
            switch (this.chartName) {
                case "pie":
                    series = highChart.series[0];
                    series.data[index].setState();
                    break;
                case "box":
                    seriesId = $target.attr("series-id");
                    if (seriesId) {
                        series = highChart.get(seriesId);
                        series.update({
                            "lineWidth": 2
                        });
                    }
                    break;
                case "dot":
                    break;
                default:
                    series = highChart.series[index];
                    if ($target.attr("series-id")) {
                        series.update({
                            "lineWidth": 2
                        });
                    } else {
                        dataLength = series.data.length;
                        for (loopVar = 0; loopVar < dataLength; loopVar++) {
                            series.data[loopVar].setState();
                        }
                    }
                    break;
            }
        },
        "setDropDownId": function(id) {
            this.dropDownId = id;
        },
        "getDropDownId": function() {
            return this.dropDownId;
        },
        "_showHideSeries": function(event, $target) {
            if (event !== false) {
                $target = $(event.currentTarget);
                this._mouseLeaveLegend(event);
            }
            var dataIndex,
                currentSeriesData,
                pointSeries,
                removeBoxData,
                chartData,
                xAxis,
                NUMBER_OF_ELEMENTS_TO_REMOVE = 1,
                removeIndex,
                headers,
                headerLength,
                points = [],
                colors,
                seriesId,
                hidden,
                removeBoxDataLength,
                boxData,
                boxPointData,
                actualMaxMinData, dataLength, boxDataPoints = [],
                outliersLength, outlierPoints = [],
                outlierSeries,
                outlierData,
                MIN = 0,
                Q1 = 1,
                MEDIAN = 2,
                Q3 = 3,
                MAX = 4,
                loopVar,
                pointIndex,
                series,
                model = this.model,
                hiddenSeries = model.get('hiddenSeries'),
                index = Number($target.attr("index-data")),
                highChart = this.$(".charts").highcharts();

            switch (this.chartName) {
                case "pie":
                    series = highChart.series[0];
                    currentSeriesData = series.data[index];
                    if (currentSeriesData.visible) {
                        currentSeriesData.setState();
                        currentSeriesData.setVisible(false);
                        $target.addClass("deselected");
                        hidden = true;
                    } else {
                        currentSeriesData.setVisible(true);
                        $target.removeClass("deselected");
                        hidden = false;
                    }
                    break;
                case "box":
                    seriesId = $target.attr("series-id");
                    if (seriesId) {
                        series = highChart.get(seriesId);
                        if ($target.hasClass("deselected")) {
                            series.show();
                            $target.removeClass("deselected");
                            hidden = false;

                        } else {
                            series.hide();
                            $target.addClass("deselected");
                            hidden = true;
                        }
                    } else {
                        series = highChart.series[0];
                        pointSeries = highChart.series[1];
                        outlierSeries = highChart.series[2];
                        xAxis = highChart.xAxis[0];
                        removeBoxData = model.get("removeBoxData");
                        chartData = model.get("chartData");
                        headers = model.get("tableHeaders").slice();
                        colors = model.get("columnColors").slice();
                        boxData = chartData.box.slice();
                        boxPointData = chartData.points.slice();
                        removeBoxDataLength = removeBoxData.length;
                        actualMaxMinData = chartData.actualMaxMin.slice();
                        outlierData = chartData.outlierPoints.slice();
                        if ($target.hasClass("deselected")) {
                            dataIndex = removeBoxData.indexOf(index);
                            removeBoxData.splice(dataIndex, NUMBER_OF_ELEMENTS_TO_REMOVE);
                            removeBoxDataLength--;
                            $target.removeClass("deselected");
                            hidden = false;
                        } else {
                            removeBoxData.push(index);
                            removeBoxData = model._removeDuplicates(removeBoxData);
                            removeBoxDataLength++;
                            $target.addClass("deselected");
                            hidden = true;
                        }
                        removeBoxDataLength = removeBoxData.length;
                        for (loopVar = 0; loopVar < removeBoxDataLength; loopVar++) {
                            removeIndex = removeBoxData[loopVar] - loopVar;
                            boxData.splice(removeIndex, NUMBER_OF_ELEMENTS_TO_REMOVE);
                            boxPointData.splice(removeIndex, NUMBER_OF_ELEMENTS_TO_REMOVE);
                            headers.splice(removeIndex, NUMBER_OF_ELEMENTS_TO_REMOVE);
                            colors.splice(removeIndex, NUMBER_OF_ELEMENTS_TO_REMOVE);
                            actualMaxMinData.splice(removeIndex, NUMBER_OF_ELEMENTS_TO_REMOVE);
                            outlierData.splice(removeIndex, NUMBER_OF_ELEMENTS_TO_REMOVE);
                        }
                        headerLength = headers.length;
                        for (loopVar = 0; loopVar < headerLength; loopVar++) {
                            points.push({
                                "y": boxPointData[loopVar],
                                "color": colors[loopVar]
                            });
                        }
                        dataLength = boxData.length;
                        for (loopVar = 0; loopVar < dataLength; loopVar++) {
                            boxDataPoints.push({
                                "low": boxData[loopVar][MIN],
                                "q1": boxData[loopVar][Q1],
                                "median": boxData[loopVar][MEDIAN],
                                "q3": boxData[loopVar][Q3],
                                "high": boxData[loopVar][MAX],
                                "actualMax": actualMaxMinData[loopVar][1],
                                "actualMin": actualMaxMinData[loopVar][0]
                            });
                        }
                        dataLength = outlierData.length;
                        for (loopVar = 0; loopVar < dataLength; loopVar++) {
                            outliersLength = outlierData[loopVar].length;
                            for (pointIndex = 0; pointIndex < outliersLength; pointIndex++) {
                                outlierPoints.push({
                                    "x": loopVar,
                                    "y": outlierData[loopVar][pointIndex],
                                    "color": colors[loopVar]
                                });
                            }
                        }
                        series.update({
                            "data": boxDataPoints
                        });
                        pointSeries.update({
                            "data": points
                        });
                        outlierSeries.update({
                            "data": outlierPoints
                        });
                        xAxis.update({
                            "categories": headers,
                            "max": headerLength - 1,
                            "min": 0
                        });
                        model.set("removeBoxData", removeBoxData);
                    }
                    break;
                default:
                    seriesId = $target.attr("series-id");
                    if (seriesId) {
                        series = highChart.get(seriesId);
                    } else {
                        series = highChart.series[index];
                    }
                    if (series) {
                        if ($target.hasClass('deselected')) {
                            series.show();
                            $target.removeClass("deselected");
                            hidden = false;
                        } else {
                            series.hide();
                            $target.addClass("deselected");
                            hidden = true;
                        }
                    }
                    break;
            }
            if (hidden !== void 0) {
                if (hidden === true) {
                    if (hiddenSeries.indexOf(index) === -1) {
                        hiddenSeries.push(index);
                    }
                } else {
                    hiddenSeries.splice(hiddenSeries.indexOf(index), 1);
                }

            }
            model.get('hiddenSeries', hiddenSeries);
            this.trigger('show-hide-data-series');
            var $chartLegends = this.$('.chart-legend'),
                index = $chartLegends.index($target),
                bestFit = model.get('bestFit'),
                cid = this.cid,
                $currentLegend,
                str, tableHeaders = model.get("tableHeaders").slice(),
                tableHeadersAcc = model.get('tableHeadersAcc'),
                tableHeadersAcc = tableHeadersAcc ? tableHeadersAcc.slice() : tableHeadersAcc,
                chartLabels = model.get('chartLabels'),
                tableView, columnCid,
                msg;
            if (tableHeaders[index] || this.chartName === 'pie') {
                if (this.chartName === 'pie') {
                    msg = chartLabels[index];
                } else {
                    msg = tableHeadersAcc[index];
                    if (!msg) {
                        msg = tableHeaders[index];
                    }
                }
            } else {
                _.each(bestFit, function(object) {
                    $currentLegend = $('#' + object.id + cid);
                    if (index === $chartLegends.index($currentLegend)) {
                        msg = object.name;
                    }
                });
            }
            if ($target.find('.acc-read-elem').length !== 0) {
                if ($target.hasClass("deselected")) {
                    str = this.accManagerView.getAccMessage('chart-acc-messages', 21, [msg, this.accManagerView.getAccMessage('unselected-text', 0),
                        this.accManagerView.getAccMessage('table-equation-panel-messages', 5)
                    ]);
                } else {
                    str = this.accManagerView.getAccMessage('chart-acc-messages', 21, [msg, this.accManagerView.getAccMessage('selected-text', 0),
                        this.accManagerView.getAccMessage('table-equation-panel-messages', 6)
                    ]);
                }
                this.accManagerView.setAccMessage($target.attr('id'), str);
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus($target.attr('id'));
            }
            columnCid = $target.parents('.chart-window').attr('data-column-cid');
            tableView = this.equationPanelView._getTableViewObject(this.equationPanelView.$('[data-equation-cid=' + columnCid + ']').parents('.list'));
            this._getChartAccText(tableView);
        },
        "hideLegendIndexes": function() {
            var legendCounter,
                index,
                loopVar2,
                model = this.model,
                count = 0,
                legend,
                charts = ["column", "bar", "box"],
                skipColumn = model._sortData(model.get('skipColumn')),
                skipColumnLength = skipColumn.length,
                loopVar,
                hiddenSeries = this.model._sortData(model.get('hiddenSeries').slice()),
                noOfDeselectedLegends = hiddenSeries.length,
                currentLegend;
            if (charts.indexOf(this.chartName) !== -1) {
                for (loopVar = 0; loopVar < skipColumnLength; loopVar++) {
                    index = hiddenSeries.indexOf(Number(skipColumn[loopVar]) - 1);
                    hiddenSeries.splice(index, 1);
                }
                noOfDeselectedLegends = hiddenSeries.length;
                for (loopVar = 0; loopVar < noOfDeselectedLegends; loopVar++) {
                    legend = hiddenSeries[loopVar];
                    for (loopVar2 = 0; loopVar2 < skipColumnLength; loopVar2++) {
                        if (legend > Number(skipColumn[loopVar2]) - 1) {
                            count++;
                        } else {
                            count = 0;
                            break;
                        }
                    }
                    hiddenSeries[loopVar] = legend - count;
                }
            }
            for (legendCounter = 0; legendCounter < noOfDeselectedLegends; legendCounter) {
                currentLegend = this.$('.chart-legend[index-data="' + hiddenSeries[legendCounter] + '"]');
                noOfDeselectedLegends--;
                hiddenSeries.splice(legendCounter, 1);
                if (currentLegend.length > 0) {
                    currentLegend.removeClass('deselected');
                    this._showHideSeries(false, currentLegend);
                    currentLegend.addClass('deselected');
                }
            }
        },
        "createChartWindow": function(options) {
            var chartName = options.chartName,
                tableContents = options.tableContents,
                tableNameArray = options.tableNameArray,
                highChartOptions = options.highChartOptions,
                columnCid = options.columnCid,
                bestFitObjects = options.bestFitObjects,
                columnNo = options.columnNo,
                tableView = options.tableView,
                template = MathUtilities.Components.GraphChart.templates["chart-window"]({
                    "id": "chart-window",
                    "dropDownId": "table-drop-down-" + this.cid,
                    "tableNames": tableNameArray,
                    "cid": this.cid
                }).trim(),
                model = this.model,
                self = this,
                $chartOptions,
                $chart,
                chartHeightAndWidth,
                initialHt,
                initialWidth,
                WIDTH_TOLERANCE = 6,
                HT_TOLERANCE = 20,
                NEW_HT_TOLERANCE = 5,
                CHART_OPTION_WINDOW_PADDING = 10,
                newHtWidth, chartWidth,
                $chartLegend, legendWidth,
                $checkboxTitle,
                $checkboxAxes,
                $checkboxGrid,
                $checkboxLegends,
                $checkboxAxesLabels,
                $checkboxAxesLines,
                chartSize = this.model.get("chartSize"),
                chartOptionsData = model.get("chartOptionsData"),
                optionsHt, optionsWidth,
                $chartContainer,
                $chartBox,
                CHART_RESIZE_BTN_HEIGHT = 30,
                ORIENTATION_OPTION_HEIGHT = 46,
                ORIENTATION_OPTION_WIDTH = 76,
                SPINNER_HEIGHT = 100,
                NO_BOX_CHART_DIM = 0,
                CHART_HEIGHT_PADDING = 30,
                BORDER_ADJUST = 4,
                $chartParent,
                chartParentHeight,
                spinnerOptions,
                $chartOptionsButton,
                $chartCloseButton,
                $template, $header,
                $gridGraph = $('#grid-graph'),
                rowHeader,
                spinnerValues,
                headerDelta,
                $highChartContainer,
                colNo;
            switch (chartName) {
                case 'box':
                    model.set({
                        "orientationOptionHeight": ORIENTATION_OPTION_HEIGHT,
                        "orientationOptionWidth": ORIENTATION_OPTION_WIDTH,
                        "horizontalBoxPlot": true
                    });
                    break;
                case 'histogram':
                    model.set({
                        "orientationOptionHeight": SPINNER_HEIGHT,
                        "orientationOptionWidth": ORIENTATION_OPTION_WIDTH,
                        "horizontalBoxPlot": false
                    });
                    break;
                default:
                    model.set({
                        "orientationOptionHeight": NO_BOX_CHART_DIM,
                        "orientationOptionWidth": NO_BOX_CHART_DIM,
                        "horizontalBoxPlot": false
                    });
                    break;
            }
            //replace grid-graph here
            $chartContainer = this.$container;
            $template = $(template);
            $chartContainer.append($template);
            $template.attr({
                "data-chart-name": this.options.chartName,
                "data-column-cid": columnCid
            });
            $chart = $template.find('.charts-container');
            $chartBox = $template.find('.charts');
            $chartLegend = $template.find('.legends-data');
            $header = $template.find('.chart-title-container');
            $chartOptions = $template.find('.chart-options-container');
            if (this._supportedMulitpleCharts.indexOf(chartName) > -1) {
                $template.addClass('multiple-chart');
            }
            model.set('columnNo', columnNo);
            $chartOptions.hide();
            optionsHt = Number($chartOptions.css("max-height").replace("px", ""));
            optionsWidth = Number($chartOptions.css("max-width").replace("px", ""));
            this.setElement($template);
            $highChartContainer = $template.find('.chart-window-highcharts-container');
            $highChartContainer.resizable({
                "handles": "se",
                "containment": $chartContainer,
                "start": function(event, ui) {
                    self.resizeStart();
                },
                "resize": function(event, ui) {
                    newHtWidth = self._resize(ui.element);
                },
                "stop": function(event, ui) {
                    self._resizeStop(newHtWidth[0], newHtWidth[1]);
                }
            });

            this.$(".ui-resizable-handle").addClass("chart-image-holder chart-resize-handle")
                .attr('id', 'chart-handle-' + this.cid)
                .on('keydown', _.bind(this._resizeChart, this));
            $template.find(".chart-options-button").on("click", _.bind(this._showChartOptions, this, chartName, tableView));
            $template.find(".chart-close-button-container").on("click", _.bind(this._closeChart, this, chartName));
            $template.find(".chart-title-chkbox-container").on("keydown", _.bind(this._closeOptonsAndSetFocus, this));

            $template.find(".chart-title-container").on("keydown", _.bind(this._unloadScreenForChart, this, 'title'));
            $template.find(".chart-close-button-container").on("keydown", _.bind(this._unloadScreenForChart, this, 'close'));
            this.$el.on('keydown', _.bind(this._loadScreenForChart, this, tableView));
            $template.find(".down-arrow, .up-arrow, .chart-close-button-container, .chart-options-button").hover(function() {
                    $(this).addClass("hovered");
                },
                function() {
                    $(this).removeClass("hovered");
                });
            if (chartOptionsData.chartLegendsSelected) {
                chartWidth = model.get("chartWithLegends");
            } else {
                chartWidth = model.get("chartWithoutLegends");
            }
            $chartParent = $chart.parent();
            initialHt = $chartParent.height();
            initialWidth = $chartParent.width();
            legendWidth = 1 - chartWidth;
            $chartBox.height(initialHt).width(initialWidth * chartWidth);
            $chartLegend.height(initialHt).width(initialWidth * legendWidth);
            $template.draggable({
                "handle": $header,
                "containment": $chartContainer,
                "start": function(event, ui) {
                    chartHeightAndWidth = self._chartDragStart($highChartContainer);
                    initialHt = chartHeightAndWidth.initialHt;
                    initialWidth = chartHeightAndWidth.initialWidth;
                },
                "drag": function(event, ui) {
                    self.trigger("hide-tooltip");
                },
                "stop": function(event, ui) {
                    chartHeightAndWidth.ui = ui;
                    self._chartDragStop($template, $gridGraph, $highChartContainer, chartHeightAndWidth);
                }
            });

            $checkboxTitle = $template.find(".chart-title-chkbox-container");
            $checkboxTitle.off("click.toggleTitleChkBox")
                .on("click.toggleTitleChkBox", function() {
                    self._chartTitleClicked($checkboxTitle.find(".chart-title-chkbox"), $template, chartOptionsData);
                });
            $checkboxAxes = $template.find(".chart-axes-title-chkbox-container");
            $checkboxAxes.off("click.toggleAxisTitleChkBox")
                .on("click.toggleAxisTitleChkBox", _.bind(function() {
                    this._chartAxisTitleClicked($checkboxAxes.find(".chart-axes-title-chkbox"), $template, chartOptionsData);
                }, this));

            $checkboxGrid = $template.find(".chart-gridlines-container");
            $checkboxGrid.off("click.toggleGridChkBox", _.bind(function() {
                    this._toggleCheckboxClicked($checkboxGrid.find(".chart-gridlines-chkbox"), "chartGridlinesSelected", "chart-gridlines-deactivated");
                }, this))
                .on("click.toggleGridChkBox", _.bind(function() {
                    this._toggleCheckboxClicked($checkboxGrid.find(".chart-gridlines-chkbox"), "chartGridlinesSelected", "chart-gridlines-deactivated");
                }, this));

            $checkboxLegends = $template.find(".chart-legends-container");
            $checkboxLegends.off("click.toggleLegendsChkBox", _.bind(function() {
                    this._toggleCheckboxClicked($checkboxLegends.find(".chart-legends-chkbox"), "chartLegendsSelected", "chart-legends-deactivated");
                }, this))
                .on("click.toggleLegendsChkBox", _.bind(function() {
                    this._toggleCheckboxClicked($checkboxLegends.find(".chart-legends-chkbox"), "chartLegendsSelected", "chart-legends-deactivated");
                }, this));

            $checkboxAxesLines = $template.find(".chart-axeslines-container");
            $checkboxAxesLines.off("click.toggleAxesLinesChkBox", _.bind(function() {
                    this._toggleCheckboxClicked($checkboxAxesLines.find(".chart-axeslines-chkbox"), "chartAxesLinesSelected", "chart-axeslines-deactivated");
                }, this))
                .on("click.toggleAxesLinesChkBox", _.bind(function() {
                    this._toggleCheckboxClicked($checkboxAxesLines.find(".chart-axeslines-chkbox"), "chartAxesLinesSelected", "chart-axeslines-deactivated");
                }, this));

            $checkboxAxesLabels = $template.find(".chart-axeslabels-container");
            $checkboxAxesLabels.off("click.toggleAxesLabelsChkBox", _.bind(function() {
                    this._toggleCheckboxClicked($checkboxAxesLabels.find(".chart-axeslabels-chkbox"), "chartAxesLabelsSelected", "chart-axeslabels-deactivated");
                }, this))
                .on("click.toggleAxesLabelsChkBox", _.bind(function() {
                    this._toggleCheckboxClicked($checkboxAxesLabels.find(".chart-axeslabels-chkbox"), "chartAxesLabelsSelected", "chart-axeslabels-deactivated");
                }, this));

            $chartOptionsButton = this.$('.chart-options-button');
            $chartCloseButton = this.$('.chart-close-button-container');

            if ('ontouchstart' in window) {
                $chartOptionsButton.on('touchstart', function() {
                    $chartOptionsButton.addClass('hovered');
                }).on('touchend', function() {
                    $chartOptionsButton.removeClass('hovered');
                });
                $chartCloseButton.on('touchstart', function() {
                    $chartCloseButton.addClass('hovered');
                }).on('touchend', function() {
                    $chartCloseButton.removeClass('hovered');
                });
            } else {
                $chartOptionsButton.on('mouseenter', function() {
                    $chartOptionsButton.addClass('hovered');
                }).on('mouseleave', function() {
                    $chartOptionsButton.removeClass('hovered');
                });
                $chartCloseButton.on('mouseenter', function() {
                    $chartCloseButton.addClass('hovered');
                }).on('mouseleave', function() {
                    $chartCloseButton.removeClass('hovered');
                });
            }
            this._updateDefaultChartOptions();
            model.set({
                "columnColors": tableContents.columnColors,
                "plotData": tableContents.points
            });
            $chartLegend.find('.chart-box').css('max-height', $chart.parent().height() - CHART_HEIGHT_PADDING - model.get('orientationOptionHeight'));
            $chartLegend.find(".chart-box").css("max-height",
                chartParentHeight - CHART_HEIGHT_PADDING - model.get("orientationOptionHeight") - CHART_RESIZE_BTN_HEIGHT);
            $chartLegend.find(".charts-legends-container").css("max-height",
                chartParentHeight - CHART_RESIZE_BTN_HEIGHT - CHART_HEIGHT_PADDING);
            $chartLegend.find('.legend-table').css('max-height', initialHt - CHART_RESIZE_BTN_HEIGHT - model.get('orientationOptionHeight'));
            if (chartName === 'histogram') {
                colNo = columnNo ? Number(tableView._getOriginalColumnNo(columnNo)) - 1 : 0;
                rowHeader = tableView.getRowHeaderState();
                headerDelta = rowHeader ? 1 : 0;

                if (this._supportedMulitpleCharts.indexOf(chartName) > -1) {
                    colNo -= headerDelta;
                }
                spinnerValues = this.updateSpinnerOnDataChange(tableContents, colNo);
                spinnerOptions = {
                    "el": this.$('.custom-spinner-container'),
                    "maxValue": spinnerValues.maxValue,
                    "minValue": spinnerValues.minValue,
                    "defaultValue": spinnerValues.defaultValue,
                    "allValues": spinnerValues.intervalArray,
                    "showSign": true,
                    "isEditable": true,
                    "title": this.accManagerView.getMessage('dummy-chart-text', 7),
                    "spinId": this.cid
                };
                this.spinnerView = MathUtilities.Components.Spinner.Views.Spinner.generateCustomSpinner(spinnerOptions);
                this.spinnerView.on('data-value-changed', _.bind(this.setBinValue, this, tableView));
                model.set("bins", this.spinnerView.currentValue);
            }

            this._setAndDrawChart({
                "tableContents": tableContents,
                "chartName": chartName,
                "$chart": $chartBox,
                "chartOptions": highChartOptions,
                "columnNo": columnNo,
                "tableView": tableView
            });
            /*eslint-disable new-cap*/
            $.fn.EnableTouch(".chart-header");
            $.fn.EnableTouch(".ui-resizable-handle");
            /*eslint-enable new-cap*/
            // to solve issue with focus on input field for touch device
            this._makeInputsFocusableForTouchDevices();
            this.$el.attr('data-column-no', columnNo);
            this._createLocAccJson();
        },

        "_chartDragStart": function($highChartContainer) {
            this.trigger("chart-dragged");
            this.trigger("hide-tooltip");
            return {
                "initialHt": $highChartContainer.height(),
                "initialWidth": $highChartContainer.width()
            };
        },

        "_chartDragStop": function($template, $gridGraph, $highChartContainer, chartHeightAndWidth) {
            var ui = chartHeightAndWidth.ui;
            this.trigger("hide-tooltip");

            this.model.set("chartPosition", {
                "top": ui.position.top,
                "left": ui.position.left
            });
            $template.data('position', {
                "top": ui.position.top,
                "left": ui.position.left
            });
        },
        "resizeStart": function(event) {
            var $highChartContainer = this.$('.chart-window-highcharts-container'),
                $gridGraph = $('#grid-graph'),
                $template = this.$el,
                BORDER_ADJUST = 14,
                chartMaxWidth, chartMaxHeight, templateOffset, gridOffset, maxWidth, maxHeight, initialHt, initialWidth;
            $highChartContainer.addClass("chart-window-resize");
            templateOffset = $template.offset();
            gridOffset = $gridGraph.offset();
            maxWidth = $gridGraph.width() - (templateOffset.left - gridOffset.left) - BORDER_ADJUST;
            maxHeight = $gridGraph.height() - (templateOffset.top - gridOffset.top) - $template.find('.chart-header').height() - BORDER_ADJUST;
            initialHt = $highChartContainer.height();
            initialWidth = $highChartContainer.width();
            $highChartContainer.css({
                "max-width": maxWidth,
                "max-height": maxHeight,
                "height": initialHt,
                "width": initialWidth
            });
        },
        "_resize": function(element) {
            var WIDTH_TOLERANCE = 6,
                CHART_OPTION_WINDOW_PADDING = 10,
                newHt,
                newWidth,
                templateHt = element.height() - 20, // height tolerance
                templateWidth = element.width() - WIDTH_TOLERANCE,
                $chartOptions = this.$('.chart-options-container'),
                optionsHt = Number($chartOptions.css("max-height").replace("px", "")),
                optionsWidth = Number($chartOptions.css("max-width").replace("px", ""));
            this.$('.chart-window-highcharts-container').addClass("chart-window-resize");
            if (templateHt < optionsHt || templateWidth < optionsWidth) {
                if (templateWidth < optionsWidth) {
                    newHt = templateHt;
                    newWidth = templateWidth;
                } else {
                    newHt = templateHt;
                    newWidth = optionsWidth;
                }
            } else {
                newHt = optionsHt;
                newWidth = optionsWidth + WIDTH_TOLERANCE;
            }
            newHt -= 5; // height tolerance
            $chartOptions.height(newHt - CHART_OPTION_WINDOW_PADDING)
                .width(newWidth - CHART_OPTION_WINDOW_PADDING);
            return [newHt, newWidth];

        },
        "_resizeStop": function(newHt, newWidth) {
            var chartWidth,
                legendWidth,
                initialHt,
                initialWidth,
                model = this.model,
                CHART_HEIGHT_PADDING = 30,
                chartResizeBtnHeight = 30,
                $chart = this.$('.charts-container'),
                $chartBox = this.$('.charts'),
                $chartLegend = this.$('.legends-data'),
                chartSize = this.model.get("chartSize"),
                chartOptionsData = model.get("chartOptionsData");

            if (chartOptionsData.chartLegendsSelected) {
                chartWidth = model.get("chartWithLegends");
            } else {
                chartWidth = model.get("chartWithoutLegends");
            }
            legendWidth = 1 - chartWidth;
            initialHt = $chart.parent().height();
            initialWidth = $chart.parent().width();
            $chart.height(initialHt).width(initialWidth);
            $chartBox.height(initialHt).width(initialWidth * chartWidth);
            $chartLegend.height(initialHt).width(initialWidth * legendWidth);
            this.$('.chart-window-highcharts-container').removeClass("chart-window-resize");
            $chartLegend.find(".chart-box").css("max-height",
                initialHt - CHART_HEIGHT_PADDING - model.get("orientationOptionHeight") - chartResizeBtnHeight);
            $chartLegend.find(".charts-legends-container").css("max-height", initialHt - CHART_HEIGHT_PADDING);
            $chartLegend.find(".legend-table").css("max-height", initialHt - chartResizeBtnHeight - model.get("orientationOptionHeight"));
            chartSize.chart.height = initialHt;
            chartSize.chart.width = initialWidth;
            chartSize.chartOptions.height = newHt;
            chartSize.chartOptions.width = newWidth;
            this.model.set("chartSize", chartSize);
            this._updateChartLegendSize();
            this._setIndexDataOfDeselectedLegends();
            this._drawChart();
            this._deselectLegends();
            this.trigger('hide-tooltip');
            if (this.$('chart-title-container-' + this.cid + 'acc-read-elem').length > 0) {
                this.accManagerView.updateFocusRect(this.$el.attr('id'));
                this.accManagerView.updateFocusRect('chart-title-container-' + this.cid);
                this.accManagerView.updateFocusRect('chart-of-' + this.cid);
                this.accManagerView.updateFocusRect('legend-table-of-' + this.cid);
            }
        },
        "_resizeChart": function(event) {
            var $highChartContainer = this.$('.chart-window-highcharts-container'),
                width = Number($highChartContainer.css('width').replace("px", "")),
                height = Number($highChartContainer.css('height').replace("px", "")),
                DEFAULT = 15,
                newHtWidth,
                isArrowKey = true;
            switch (event.keyCode) {
                case 39: //right arrow
                    width += DEFAULT;
                    break;
                case 38: //up arrow
                    height -= DEFAULT;
                    break;
                case 37: //left arrow
                    width -= DEFAULT;
                    break;
                case 40: //down arrow
                    height += DEFAULT;
                    break;
                default:
                    isArrowKey = false;
                    break;
            }
            if (isArrowKey || event.isCustomEvent) {
                $highChartContainer.css({
                    "width": width,
                    "height": height
                });
                this.resizeStart();
                newHtWidth = this._resize($highChartContainer);
                this.$(".ui-resizable-handle").off('keyup').on('keyup', _.bind(function() {
                    this._resizeStop(newHtWidth[0], newHtWidth[1]);
                    if (this.$('#chart-handle-' + this.cid).find('.acc-read-elem').length !== 0) {
                        this.accManagerView.setFocus('dummy-focus-container');
                        this.accManagerView.setFocus('chart-handle-' + this.cid);
                        this.accManagerView.setAccMessage('chart-handle-' + this.cid, this.accManagerView.getAccMessage('chart-acc-messages', 2));
                    }
                }, this));
                if (this.$('#chart-handle-' + this.cid).find('.acc-read-elem').length !== 0) {
                    this.accManagerView.setAccMessage('chart-handle-' + this.cid, this.accManagerView.getAccMessage('chart-acc-messages', 22));
                }
            }

        },

        "setDefaultValueForSpinner": function() {
            this.spinnerView.updateSpinValue(this.spinnerView.model.get('defaultValue'));
        },
        "updateSpinnerOnDataChange": function(tableContents, columnNo) {
            var data, arrayOfRange, intervalArray;
            if (tableContents.chartData === void 0) {
                data = this.model.removeBlankTableCell(tableContents);
                columnNo = columnNo || 0;
                arrayOfRange = data[columnNo];
                if (!arrayOfRange || arrayOfRange.length === 0) {
                    return {
                        "minValue": '',
                        "maxValue": '',
                        "defaultValue": null,
                        "intervalArray": null
                    };
                }
                arrayOfRange = this.model._sortData(arrayOfRange.slice());
                intervalArray = this.model.getIntervalArray(arrayOfRange);
                return {
                    "minValue": intervalArray[8],
                    "maxValue": intervalArray[0],
                    "defaultValue": intervalArray[1],
                    "intervalArray": intervalArray
                };
            }
        },
        "setBinValue": function(tableView) {
            var model = this.model,
                isUpdate = true;
            model.set("bins", this.spinnerView.currentValue);
            this.updateChartData({
                "tableContents": model.get('tableContents'),
                "chartOptions": null,
                "histogramData": model.get('tableData').slice(),
                "isUpdate": isUpdate,
                "tableView": tableView,
                "setValue": true
            });
            this._getChartAccText(tableView);
        },
        "_closeChart": function(chartName) {
            this.trigger("chart-close-btn-clicked", this.$(".chart-close-button"));
        },
        "setChartTable": function(tableNumber) {
            this.model.get("chartOptionsData").chartTable = tableNumber;
        },
        "_setAndDrawChart": function(options) {
            var tableContents = options.tableContents,
                chartName = options.chartName,
                $chart = options.$chart,
                chartOptions = options.chartOptions,
                columnNo = options.columnNo,
                tableView = options.tableView,
                data, errorMessage = "",
                model = this.model,
                rowHeader = tableView.getRowHeaderState(),
                headerDelta = rowHeader ? 1 : 0,
                defaultNameTitleMap = model.get("defaultNameTitleMap"),
                colNo = columnNo ? Number(tableView._getOriginalColumnNo(columnNo)) - 1 : 0;

            if (this._supportedMulitpleCharts.indexOf(chartName) > -1) {
                colNo -= headerDelta;
            }
            model.set("columnColors", tableContents.columnColors);
            model.set('tableContents', tableContents);
            switch (chartName) {
                case "bar":
                    data = model.changeBlankTableCellValue(tableContents);
                    model._calculateBarChartData(data);
                    model.set("chartTitle", defaultNameTitleMap[chartName]);
                    break;
                case "dot":
                    if (typeof tableContents.chartData === "undefined") {
                        data = model.removeBlankTableCell(tableContents);
                        model._calculateDotChartData(data, colNo, headerDelta);
                    } else {
                        model._setDotChartData(tableContents.chartData);
                    }
                    model.set({
                        "chartTitle": defaultNameTitleMap[chartName],
                        "tableHeadersAcc": tableContents.headersAcc
                    });
                    break;
                case "box":
                    if (typeof tableContents.chartData === "undefined") {
                        data = model.removeBlankTableCell(tableContents);
                        errorMessage = model._calculateBoxChartData(data);
                    } else {
                        model._setBoxChartData(tableContents.chartData);
                    }
                    model.set({
                        "chartTitle": defaultNameTitleMap[chartName],
                        "removeBoxData": [],
                        "tableHeadersAcc": tableContents.headersAcc

                    });
                    this._showOrientionRadioBtns();
                    break;
                case "column":
                    data = model.changeBlankTableCellValue(tableContents);
                    model._calculateColumnChartData(data);
                    model.set({
                        "chartTitle": defaultNameTitleMap[chartName],
                        "tableHeadersAcc": tableContents.headersAcc
                    });
                    break;
                case "pie":
                    data = model.convertTableDataForPie(tableContents, colNo);
                    model._calculatePieChartData(data);
                    break;
                case "histogram":
                    if (typeof tableContents.chartData === "undefined") {
                        data = model.removeBlankTableCell(tableContents);
                        data = model._updateHistogramRangeThroughBins(data.slice(), colNo);
                        errorMessage = model._calculateHistogramData(data, colNo, headerDelta);
                    } else {
                        model._setHistogramData(tableContents.chartData);
                    }
                    model.set({
                        "chartTitle": defaultNameTitleMap[chartName],
                        "tableHeadersAcc": tableContents.headersAcc
                    });
                    break;
            }
            this._setChartTitle("", colNo, false, rowHeader);
            if (errorMessage !== "error") {
                model._setHighChart(chartName, tableContents.markerObj, chartOptions, colNo);
                this._drawHighChart($chart, chartName, true, columnNo);
            }
            if (chartOptions) {
                this._setChartOption(columnNo, tableView);
            }
            this._detachHoverEffect(".chart-legend", this._mouseOverLegend, this._mouseLeaveLegend);
            this._attachHoverEffect(".chart-legend", this._mouseOverLegend, this._mouseLeaveLegend);
        },
        "_sendChartPointsToTable": function(obj, columnNo) {
            this.trigger("chart-points-calculated", obj, columnNo);
        },
        /**
         * Update data of charts and redraw charts
         * @method updateChartData
         * @param {Object} [tableContents] table data
         * @param {Object} [chartOptions] highchart options
         * @param {Object} [histogramData] calculated histogram data to directly plot on chart
         * @param {Boolean} isUpdate is table data updated
         * @param {Object} tableView is table reference
         * @return void
         */
        "updateChartData": function(options) {
            var tableContents = options.tableContents,
                chartOptions = options.chartOptions,
                histogramData = options.histogramData,
                isUpdate = options.isUpdate,
                tableView = options.tableView,
                chart,
                model = this.model,
                chartName = this.chartName,
                rowHeader = tableView.getRowHeaderState(),
                columnNo = model.get("columnNo"),
                headerDelta = rowHeader ? 1 : 0,
                content,
                spinnerValues,
                colNo = columnNo ? Number(tableView._getOriginalColumnNo(columnNo)) - 1 : 0;
            if (["pie", "histogram", "dot"].indexOf(chartName) > -1) {
                colNo -= headerDelta;
                if (colNo === -1) {
                    return;
                }
            }
            model.set({
                "tableContents": tableContents,
                "columnColors": tableContents.columnColors,
                "plotData": tableContents.points
            });
            if (chartName === 'histogram' && !options.setValue) {
                spinnerValues = this.updateSpinnerOnDataChange(tableContents, colNo);
                this.spinnerView.updateSpinnerDefaults(spinnerValues);
                model.set("bins", this.spinnerView.currentValue);
            }
            chart = model._updateChartData(tableContents, chartOptions, histogramData, colNo, headerDelta);
            content = tableContents.functionLabelOptions[colNo];
            this._setChartTitle("", colNo, content && content === "L", rowHeader);
            if (chart !== "error") {
                this._addLegendsToCharts();
                this.trigger("add-or-draw-best-fit", this.chartName, isUpdate);
                this._deselectLegends();
                this._bindAxisTitleTooltip();
            }
        },
        "_hideZeroValueChart": function() {
            var model = this.model,
                loopVar,
                loopVar2,
                currentSeriesData,
                highChart = this.$(".charts").highcharts(),
                chartData = model.get("chartData"),
                dataLength,
                seriesDataLength,
                series,
                seriesData;
            dataLength = chartData.length;
            for (loopVar = 0; loopVar < dataLength; loopVar++) {
                series = highChart.series[loopVar];
                seriesData = series.data;
                seriesDataLength = seriesData.length;
                for (loopVar2 = 0; loopVar2 < seriesDataLength; loopVar2++) {
                    currentSeriesData = seriesData[loopVar2];
                    if (currentSeriesData.y === 0) {
                        currentSeriesData.pointAttr[""].fill = "rgba(255, 255, 255, 0)";
                        currentSeriesData.pointAttr[""].stroke = "rgba(255, 255, 255, 0)";
                        currentSeriesData.pointAttr.hover.fill = "rgba(255, 255, 255, 0)";
                        currentSeriesData.pointAttr.hover.stroke = "rgba(255, 255, 255, 0)";
                    }
                }
            }
        },
        "_toggleCheckboxClicked": function($checkbox, requiredOption, triggerEventString) {
            var chartOptionsData, accMessageId;
            if ($checkbox.parent().hasClass('chart-disabled-option')) {
                return void 0;
            }
            chartOptionsData = this.model.get("chartOptionsData");
            $checkbox.toggleClass("deactivated");
            switch (requiredOption) {
                case 'chartGridlinesSelected':
                    accMessageId = 9;
                    break;
                case 'chartLegendsSelected':
                    accMessageId = 10;
                    if (this.$('#legend-table-of-' + this.cid).find('.acc-read-elem').length !== 0) {
                        if ($checkbox.hasClass('deactivated')) {
                            this.accManagerView.enableTab('legend-table-of-' + this.cid, false);
                        } else {
                            this.accManagerView.enableTab('legend-table-of-' + this.cid, true);
                        }
                    }
                    break;
                case 'chartAxesLinesSelected':
                    accMessageId = 11;
                    break;
                case 'chartAxesLabelsSelected':
                    accMessageId = 12;
                    break;
            }
            if ($checkbox.hasClass('deactivated')) {
                this.trigger('' + triggerEventString);
                chartOptionsData[requiredOption] = false;
                this.accManagerView.setAccMessage($checkbox.parent().attr('id'),
                    this.accManagerView.getAccMessage('chart-acc-messages', accMessageId, [this.accManagerView.getAccMessage('unchecked-text', 0),
                        this.accManagerView.getAccMessage('show-text', 0)
                    ]));
            } else {
                chartOptionsData[requiredOption] = true;
                this.accManagerView.setAccMessage($checkbox.parent().attr('id'),
                    this.accManagerView.getAccMessage('chart-acc-messages', accMessageId, [this.accManagerView.getAccMessage('checked-text', 0),
                        this.accManagerView.getAccMessage('hide-text', 0)
                    ]));
            }
            this.accManagerView.setFocus('dummy-focus-container');
            this.accManagerView.setFocus($checkbox.parent().attr('id'));
            this.model.set("chartOptionsData", chartOptionsData);
            this.chartOptionsUpdated = true;
        },
        "_makeInputsFocusableForTouchDevices": function() {
            this.$("input").off("touchstart touchcancel touchend touchmove").on("touchstart touchcancel touchend touchmove", function(e) {
                e.stopPropagation();
            });
        },
        "_chartTitleClicked": function($checkboxTitle, $template) {

            var chartOptionsData = this.model.get("chartOptionsData");
            $checkboxTitle.toggleClass('deactivated');
            if ($checkboxTitle.hasClass('deactivated')) {
                $template.find('.chart-title-textbox').prop('disabled', true);
                this.enableTab($template.find('.chart-title-text').attr('id'), false);
                chartOptionsData.chartTitleSelected = false;
                chartOptionsData.chartTitle = this.model.get("chartTitle");
                this.trigger("chart-title-deactivated");
                this.accManagerView.setAccMessage('chart-title-chkbox-container-' + this.cid,
                    this.accManagerView.getAccMessage('chart-acc-messages', 4, [this.accManagerView.getAccMessage('unchecked-text', 0),
                        this.accManagerView.getAccMessage('table-equation-panel-messages', 5)
                    ]));
            } else {
                chartOptionsData.chartTitleSelected = true;
                $template.find(".chart-title-textbox").prop("disabled", false);
                this.enableTab($template.find('.chart-title-text').attr('id'), true);
                this.accManagerView.setAccMessage('chart-title-chkbox-container-' + this.cid,
                    this.accManagerView.getAccMessage('chart-acc-messages', 4, [this.accManagerView.getAccMessage('checked-text', 0),
                        this.accManagerView.getAccMessage('table-equation-panel-messages', 6)
                    ]));
            }
            this.accManagerView.setFocus('dummy-focus-container');
            this.accManagerView.setFocus('chart-title-chkbox-container-' + this.cid);
            this.chartOptionsUpdated = true;
            this.model.set("chartOptionsData", chartOptionsData);
        },
        "_chartAxisTitleClicked": function($checkboxAxes, $template) {

            var defaultMask = this.model.get("defaultMask"),
                chartOptionsData = this.model.get("chartOptionsData"),
                bitsObject = this.BITS_OBJECT,
                bitNo = Number(bitsObject.CHART_Y_AXIS_TITLE);
            bitNo = 1 << bitNo;
            $checkboxAxes.toggleClass("deactivated");
            if ($checkboxAxes.hasClass("deactivated")) {
                $template.find(".chart-x-axis-title-textbox, .chart-y-axis-title-textbox").prop("disabled", true);
                this.enableTab($template.find('.chart-x-axis-title-text').attr('id'), false);
                this.enableTab($template.find('.chart-y-axis-title-text').attr('id'), false);
                chartOptionsData.chartAxesTitlesSelected = false;
                this.trigger("chart-axes-title-deactivated");
                this.accManagerView.setAccMessage('chart-axes-title-chkbox-' + this.cid,
                    this.accManagerView.getAccMessage('chart-acc-messages', 6, [this.accManagerView.getAccMessage('unchecked-text', 0),
                        this.accManagerView.getAccMessage('table-equation-panel-messages', 5)
                    ]));
            } else {
                chartOptionsData.chartAxesTitlesSelected = true;
                $template.find(".chart-x-axis-title-textbox").prop("disabled", false);
                this.enableTab($template.find('.chart-x-axis-title-text').attr('id'), true);
                if ((bitNo & defaultMask) !== 0) {
                    $template.find(".chart-y-axis-title-textbox").prop("disabled", false);
                    this.enableTab($template.find('.chart-y-axis-title-text').attr('id'), true);
                }
                this.accManagerView.setAccMessage('chart-axes-title-chkbox-' + this.cid,
                    this.accManagerView.getAccMessage('chart-acc-messages', 6, [this.accManagerView.getAccMessage('checked-text', 0),
                        this.accManagerView.getAccMessage('table-equation-panel-messages', 6)
                    ]));
            }
            this.accManagerView.setFocus('dummy-focus-container');
            this.accManagerView.setFocus('chart-axes-title-chkbox-' + this.cid);
            this.chartOptionsUpdated = true;
            this.model.set("chartOptionsData", chartOptionsData);
        },
        "_showChartOptions": function(chartName, tableView) {
            var $chartWindow = this.$el,
                $chartOptions = $chartWindow.find(".chart-options-container");
            if ($chartOptions.hasClass("visible")) {
                this._updateOptions($chartWindow, chartName, $chartOptions, tableView);
                $chartOptions.hide().removeClass('visible');
            } else {
                this.trigger("show-chart-options");
                $chartOptions.show().addClass('visible').scrollTop(0).scrollLeft(0); //to keep scroll bar at default position
            }
            this.$(".chart-options-button").toggleClass("selected");
            this.accManagerView.setFocus('chart-title-chkbox-container-' + this.cid);
        },

        "hideChartOptions": function(tableView) {

            var $chartWindow = this.$el,
                $chartOptions = $chartWindow.find(".chart-options-container");
            $chartOptions.hide().removeClass("visible");
            this.$('.chart-options-button').removeClass('selected hovered');
            this._updateOptions($chartWindow, this.chartName, $chartOptions, tableView);
        },

        "_drawHighChart": function($highChartContainer, chartName, isUpdate, columnNo) {
            var self = this,
                chartWindow = this.$el,
                chart, dontPlot = true,
                dontPlot = true,
                xAxisLabel, yAxisLabel,
                chartOptions = this.model.get("chartOptionsData"),
                mathquillLabelCharts = ["bar", "column", "box", "histogram"],
                mathquillLabelToolTipCharts = ['bar', 'column', 'pie'],
                xAxis, yAxisTitleText,
                yAxis, xAxisTitleText,
                model = this.model,
                temp;
            xAxisLabel = chartOptions.xAxisLabel;
            yAxisLabel = chartOptions.yAxisLabel;
            chart = model.get("chart");
            xAxis = model.get("xAxisTitle");
            yAxis = model.get("yAxisTitle");
            xAxisTitleText = chartWindow.find(".chart-x-axis-title-textbox");
            yAxisTitleText = chartWindow.find(".chart-y-axis-title-textbox");
            if (chart === null) {
                return void 0; // return to avoid multiple clicks on error chart
            }
            if (chartName === "bar" || model.get("horizontalBoxPlot") === true) {
                temp = xAxis;
                xAxis = yAxis;
                yAxis = temp;
            }
            if (chartName !== "pie") {
                if (xAxisTitleText.val() === "") {
                    chart.xAxis.title = {
                        "text": xAxis
                    };
                } else {
                    xAxis = xAxisLabel;
                }
            }
            if (chartName !== "pie" && chartName !== "dot") {
                if (yAxisTitleText.val() === "") {
                    chart.yAxis.title = {
                        "text": yAxis
                    };
                } else {
                    yAxis = yAxisLabel;
                }
            }
            model.set({
                "currentXAxisTitle": xAxis,
                "currentYAxisTitle": yAxis
            });
            if (chart !== "error") {
                if (chart.tooltip) {
                    chart.tooltip.hideDelay = 10;
                    chart.tooltip.useHTML = true;
                } else {
                    chart.tooltip = {
                        "hideDelay": 10,
                        "animation": false,
                        "useHTML": true
                    };
                }
                if (mathquillLabelCharts.indexOf(chartName) !== -1) {
                    chart.xAxis.labels.formatter = function() {
                        var MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                            $mathquillLabel = $(MathUtilities.Components.GraphChart.templates['chart-mathquill']().trim()),
                            latex = MathHelper._generateLatexFromHtml(MathUtilities.Components.GraphChart.Models.Chart._getDisplayableDataValues(this.value, MathUtilities.Components.GraphChart.Models.Chart.PRECISION_FOR_CHARTS, true)),
                            $mathquill;
                        $mathquill = $mathquillLabel.addClass('chart-label-mathquill-container').find('.chart-mathquill');
                        MathUtilities.Components.MathEditor.Views.MathEditor.createDisabledMathquill($mathquill, latex);
                        if (self.chartName === 'histogram') {
                            $mathquillLabel.addClass('chart-label-mathquill-container').find('.chart-mathquill').addClass('histogram-label');
                        }
                        $("<div class='blur-hide'></div>").appendTo($mathquillLabel);
                        return $mathquillLabel.prop("outerHTML");
                    };
                    chart.yAxis.labels.formatter = function() {
                        var MathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                            $mathquillLabel = $(MathUtilities.Components.GraphChart.templates['chart-mathquill']().trim()),
                            latex = MathHelper._generateLatexFromHtml(MathUtilities.Components.GraphChart.Models.Chart._getDisplayableDataValues(this.value, MathUtilities.Components.GraphChart.Models.Chart.PRECISION_FOR_CHARTS, true)),
                            $mathquill;
                        $mathquill = $mathquillLabel.addClass('chart-label-mathquill-container').find('.chart-mathquill');
                        MathUtilities.Components.MathEditor.Views.MathEditor.createDisabledMathquill($mathquill, latex);

                        if (self.chartName === 'histogram') {
                            $mathquillLabel.addClass('chart-label-mathquill-container').find('.chart-mathquill')
                                .addClass('histogram-label');
                        }
                        $('<div class="blur-hide"></div>').appendTo($mathquillLabel);
                        return $mathquillLabel.prop('outerHTML');
                    };
                }
                if (mathquillLabelToolTipCharts.indexOf(this.chartName) !== -1) {
                    chart.tooltip.formatter = function() {
                        if (this.point.orgVal === '') {
                            return false;
                        }
                        // Passing limit value directly as the value is cached and doesn't get updated when formatter function is called.
                        var tooltipValue = MathUtilities.Components.GraphChart.Models.Chart._getDisplayableDataValues(this.y, MathUtilities.Components.GraphChart.Models.Chart.PRECISION_FOR_CHARTS, false),
                            $mathquillLabel = $(MathUtilities.Components.GraphChart.templates['chart-mathquill']({
                                "showValue": true
                            }).trim()),
                            latex = this.key,
                            $mathquill;
                        $mathquill = $mathquillLabel.addClass('chart-tool-tip-mathquill-container').find('.chart-mathquill');
                        MathUtilities.Components.MathEditor.Views.MathEditor.createDisabledMathquill($mathquill, latex);
                        $mathquillLabel.find('.chart-tool-tip-value').html(tooltipValue);
                        $('<div class="blur-hide"></div>').appendTo($mathquillLabel);
                        return $mathquillLabel.prop('outerHTML');
                    };
                }
                model.set("chart", chart);
                this._addLegendsToCharts();
                this.trigger("add-or-draw-best-fit", chartName, isUpdate, dontPlot);
                this._updateChartLegendSize();
                this._bindAxisTitleTooltip();
            }
        },
        "_bindAxisTitleTooltip": function() {
            var model = this.model,
                chartWindow = this.$el,
                $xAxisTitle,
                $yAxisTitle,
                xAxis = model.get('currentXAxisTitle'),
                yAxis = model.get('currentYAxisTitle');
            if (this.chartName !== 'pie') {
                $xAxisTitle = chartWindow.find('.highcharts-xaxis-title');
                $xAxisTitle.off('mouseenter')
                    .on("mouseenter", _.bind(this._chartTitleMouseOver, this, $xAxisTitle, xAxis, false))
                    .off("mouseleave")
                    .on("mouseleave", _.bind(this._chartTitleMouseLeave, this))
                    .off("touchend")
                    .on("touchend", _.bind(this._chartTitleMouseUp, this));

                if (this.chartName !== 'dot') {
                    $yAxisTitle = chartWindow.find('.highcharts-yaxis-title');
                    $yAxisTitle.off('mouseenter')
                        .on("mouseenter", _.bind(this._chartTitleMouseOver, this, $yAxisTitle, yAxis, false))
                        .off("mouseleave")
                        .on("mouseleave", _.bind(this._chartTitleMouseLeave, this))
                        .off("touchend")
                        .on("touchend", _.bind(this._chartTitleMouseUp, this));
                }
            }
        },
        "_chartTitleMouseUp": function() {
            if ($.support.touch) {
                this.trigger('hide-tooltip');
            }
        },
        "_addLegendsToCharts": function() {
            var model = this.model,
                labels,
                $legendBox,
                headers,
                color = model.get("columnColors"),
                indexDataOfDeselectedLegends = [],
                $highChartContainer = this.$(".charts-container"),
                $legendItems,
                LIMIT = this.equationPanelView.getPrecision(),
                chartName = this.chartName,
                counter,
                chartLegend,
                $chartLegend,
                legendItemsLength,
                legend,
                currentLegend,
                noOfDeselectedLegends,
                legendCounter,
                $deselectedLegends,
                Chart = MathUtilities.Components.GraphChart.Models.Chart,
                legends = [];

            chartLegend = MathUtilities.Components.GraphChart.templates["single-legend"]().trim();
            switch (chartName) {
                case "bar":
                case "column":
                case "box":
                    headers = model.get("tableHeaders");
                    legends = headers;
                    break;
                case "histogram":
                    $deselectedLegends = this.$('.chart-legend.deselected');
                    noOfDeselectedLegends = $deselectedLegends.length;
                    if (noOfDeselectedLegends !== 0) {
                        for (legendCounter = 0; legendCounter < noOfDeselectedLegends; legendCounter++) {
                            indexDataOfDeselectedLegends[legendCounter] = $($deselectedLegends[legendCounter]).attr('index-data');
                        }
                        model.set('indexDataOfDeselectedLegends', indexDataOfDeselectedLegends);
                    }
                    // falls through
                case 'dot':
                    $legendItems = $highChartContainer.find('.charts-legends');
                    $legendItems.empty();
                    return;
                case "pie":
                    labels = model.get("chartLabels");
                    legends = labels;
                    break;
            }
            legendItemsLength = legends.length;
            $legendItems = $highChartContainer.find(".charts-legends");
            $deselectedLegends = this.$(".chart-legend.deselected");
            $legendItems.empty();
            for (counter = 0; counter < legendItemsLength; counter++) {

                $legendItems.append(chartLegend);
                legend = legends[counter];
                $legendBox = $legendItems.find(".chart-legend").eq(counter);
                $legendBox.attr({
                    "index-data": counter,
                    "id": 'chart-legend-' + counter + '-' + this.cid
                });

                if (legend === "") {
                    $legendBox.hide();
                    continue;
                }
                if (this.chartName === "dot") {
                    $legendBox.find(".symbol-box").addClass("dot-cross");
                } else {
                    $legendBox.find(".symbol-box").css("background-color", color[counter]);
                }
                $chartLegend = $legendItems.find(".text-box").eq(counter);
                if (legend === "") {
                    $chartLegend.html(legend);
                } else {
                    if (!isNaN(Number(legend))) {
                        $chartLegend.html(legend).addClass("number-latex");
                    } else {
                        legend = Chart._getDisplayableDataValues(legend, LIMIT);
                        $chartLegend.mathquill("editable").mathquill("revert")
                            .mathquill().mathquill("latex", legend).off("mousedown");
                    }
                }
            }
            noOfDeselectedLegends = $deselectedLegends.length;
            if (noOfDeselectedLegends !== 0) {
                for (legendCounter = 0; legendCounter < noOfDeselectedLegends; legendCounter++) {
                    currentLegend = this.$(".chart-legend[index-data='" + $deselectedLegends.eq(legendCounter).attr("index-data") + "']");
                    this._showHideSeries(false, currentLegend);
                    currentLegend.addClass("deselected");
                }
            }
            this.$(".chart-box").scrollTop(0);
            this._showHideScrollArrows();
            this._updateChartLegendSize();
            this._addLegendElements();
        },
        "_setIndexDataOfDeselectedLegends": function() {
            var $deselectedLegends = this.$('.chart-legend.deselected'),
                legendCounter, indexDataOfDeselectedLegends = [],
                noOfDeselectedLegends = $deselectedLegends.length;
            if (noOfDeselectedLegends !== 0) {
                for (legendCounter = 0; legendCounter < noOfDeselectedLegends; legendCounter++) {
                    indexDataOfDeselectedLegends[legendCounter] = $($deselectedLegends[legendCounter]).attr('index-data');
                }
            }
            this.model.set('indexDataOfDeselectedLegends', indexDataOfDeselectedLegends)
        },
        "_deselectLegends": function() {
            if (this.$('.chart-legend').length === 0) {
                this.model.set('indexDataOfDeselectedLegends', []);
                return;
            }
            var arrayOfIndexData = this.model.get('indexDataOfDeselectedLegends'),
                legendCounter, currentLegend,
                noOfDeselectedLegends = arrayOfIndexData.length;
            if (noOfDeselectedLegends !== 0) {
                for (legendCounter = 0; legendCounter < noOfDeselectedLegends; legendCounter++) {
                    currentLegend = this.$('.chart-legend[index-data="' + arrayOfIndexData[legendCounter] + '"]');
                    if (!currentLegend.hasClass('deselected')) {
                        this._showHideSeries(false, currentLegend);
                        currentLegend.addClass('deselected');
                    }
                }
            }
        },
        "_updateChartLegendSize": function() {
            var chartWindowWidth,
                LEGEND_PADDING = 20,
                CHART_PADDING = 8,
                legendsCount, $legendCheckBox,
                minWidth = this.model.get("orientationOptionWidth"),
                $chart = this.$(".charts"),
                prevWidth,
                currentWidth, width,
                chartLegendsWidth;
            legendsCount = this.$(".chart-legend").length;
            chartWindowWidth = this.$(".charts-container").width();
            chartLegendsWidth = this.$(".chart-box").width();
            $legendCheckBox = this.$('.chart-legends-container');
            if (chartLegendsWidth < minWidth) {
                chartLegendsWidth = minWidth;
            }
            if (this.chartName === 'histogram' || this.chartName === 'dot') {
                if (legendsCount === 0) {
                    $legendCheckBox.addClass('chart-disabled-option');
                    $legendCheckBox.find('.chart-legends-chkbox').addClass('deactivated');
                    this.enableTab($legendCheckBox.attr('id'), false);
                } else {
                    $legendCheckBox.removeClass('chart-disabled-option');
                    $legendCheckBox.find('.chart-legends-chkbox').removeClass('deactivated');
                    this.enableTab($legendCheckBox.attr('id'), true);
                }
            }
            prevWidth = $chart.width();
            if (legendsCount === 0 && this.chartName !== 'histogram') {
                currentWidth = chartWindowWidth;
                width = 0;
            } else {
                currentWidth = chartWindowWidth - chartLegendsWidth - LEGEND_PADDING - CHART_PADDING;
                width = chartLegendsWidth + LEGEND_PADDING;
            }
            $chart.width(currentWidth);
            this.$('.legends-data').width(width);
            if ($chart.highcharts()) {
                if (currentWidth !== prevWidth) {
                    $chart.highcharts().setSize($chart.width(), $chart.height(), false);
                }
            }
            this._showHideScrollArrows();
        },

        "_createLegendEquation": function(name, equation) {
            return name + ": " + equation;
        },

        "updateOrAddSeries": function(seriesId, arr, color, name, equation, isUpdate) {
            var series,
                legendsLength,
                $legendItems,
                $chartLegend,
                model = this.model,
                highChart = this.$(".charts"),
                bestFit = model.get("bestFit"),
                $legendBox,
                updateLegend,
                chartContainer = this.$(".charts").parent(),
                chartLegend = MathUtilities.Components.GraphChart.templates["single-legend"]().trim();
            $legendItems = chartContainer.find(".charts-legends");
            updateLegend = $legendItems.find(".chart-legend[series-id=" + seriesId + "]");
            legendsLength = updateLegend.attr("index-data");

            series = {
                "name": name,
                "color": color,
                "id": seriesId,
                "type": "spline",
                "data": arr,
                "marker": {
                    "enabled": false,
                    "symbol": "circle"
                }
            };
            bestFit[seriesId] = series;
            if (typeof legendsLength !== "undefined") {
                $chartLegend = updateLegend.find(".text-box");
            } else {
                legendsLength = chartContainer.find(".chart-legend").length;
                $legendItems.append(chartLegend);
                $legendBox = $legendItems.find(".chart-legend").eq(legendsLength);
                $legendBox.attr({
                    "index-data": legendsLength,
                    "series-id": seriesId,
                    "id": seriesId + this.cid
                }).find(".symbol-box").css("background-color", color);
                $chartLegend = $legendItems.find(".text-box").eq(legendsLength);
                this._addLegendElements(seriesId + this.cid);
            }
            $chartLegend.mathquill("editable").mathquill("revert").mathquill()
                .mathquill("latex", this._createLegendEquation(name, equation));
            $chartLegend.off('mousedown');
            this._showHideScrollArrows();
            model.set("bestFit", bestFit);
            if (isUpdate !== true) {
                highChart.highcharts().addSeries(series);
                this._updateChartLegendSize();
            }
        },
        "hideSeries": function(seriesId) {

            var highChart = this.$(".charts"),
                $legendItems,
                legendLength,
                model = this.model,
                highChartSeries,
                loopVar,
                bestFit = model.get("bestFit"),
                $legend, index,
                chartContainer = this.$(".charts").parent();
            $legendItems = chartContainer.find(".charts-legends");
            highChartSeries = highChart.highcharts().get(seriesId);

            if (highChartSeries) {
                highChartSeries.remove();
                $legend = $legendItems.find(".chart-legend[series-id=" + seriesId + "]");
                index = Number($legend.attr("index-data"));
                $legend.remove();
            }
            delete bestFit[seriesId];
            legendLength = $legendItems.find(".chart-legend").length;
            for (loopVar = index; loopVar < legendLength; loopVar++) {
                $legendItems.find(".chart-legend[index-data=" + (loopVar + 1) + "]").attr("index-data", loopVar);
            }
            model.set("bestFit", bestFit);
            this._updateChartLegendSize();
            this._showHideScrollArrows();
        },

        "_updateDefaultChartOptions": function() {
            var model = this.model,
                defaultMask = model.get("defaultMask"),
                axesTitleFlag = false,
                counter = 0,
                $chartOptions = this.$(".chart-options-container"),
                noOfBit = 0,
                TOTAL_BITS = 7,
                bitsObject = this.BITS_OBJECT,
                chartOptionsData = {
                    "chartTitleSelected": true,
                    "chartTitle": null,
                    "chartAxesTitlesSelected": true,
                    "chartYaxisTitleSelected": true,
                    "chartXaxisTitleSelected": true,
                    "xAxisTitle": null,
                    "yAxisTitle": null,
                    "chartGridlinesSelected": true,
                    "chartLegendsSelected": true,
                    "chartAxesLinesSelected": true,
                    "chartAxesLabelsSelected": true,
                    "chartTable": null
                };
            model.set('hiddenSeries', []);
            for (counter = 1; counter <= TOTAL_BITS; counter++) {
                noOfBit = 1 << counter;
                if ((noOfBit & defaultMask) === 0) {
                    switch (counter) {
                        case bitsObject.CHART_TITLE: //disable chart title
                            $chartOptions.find(".chart-title-options-container").addClass("chart-disabled-option");
                            $chartOptions.find(".chart-title-chkbox").addClass("deactivated");
                            $chartOptions.find(".chart-title-chkbox-container").off("click.toggleTitleChkBox");
                            $chartOptions.find(".chart-title-textbox").prop("disabled", true);
                            this.enableTab($chartOptions.find(".chart-title-chkbox-container").attr('id'), false);
                            this.enableTab($chartOptions.find(".chart-title-text").attr('id'), false);
                            chartOptionsData.chartTitleSelected = false;
                            break;
                        case bitsObject.CHART_X_AXIS_TITLE: //disable x-axis title
                            axesTitleFlag = true;
                            $chartOptions.find(".chart-x-axis-title-container").addClass("chart-disabled-option");
                            $chartOptions.find(".chart-x-axis-title-textbox").prop("disabled", true);

                            this.enableTab($chartOptions.find(".chart-x-axis-title-text").attr('id'), false);
                            chartOptionsData.chartXaxisTitleSelected = false;
                            break;
                        case bitsObject.CHART_Y_AXIS_TITLE: //disable y-axis title
                            $chartOptions.find(".chart-y-axis-title-container").addClass("chart-disabled-option");
                            $chartOptions.find(".chart-y-axis-title-textbox").prop("disabled", true);
                            this.enableTab($chartOptions.find(".chart-y-axis-title-text").attr('id'), false);
                            chartOptionsData.chartYaxisTitleSelected = false;
                            break;
                        case bitsObject.GRID_LINES: //disable gridlines
                            $chartOptions.find(".chart-gridlines-chkbox").addClass("deactivated");
                            $chartOptions.find(".chart-gridlines-container").addClass("chart-disabled-option").off("click.toggleGridChkBox");
                            this.enableTab($chartOptions.find(".chart-gridlines-container").attr('id'), false);
                            chartOptionsData.chartGridlinesSelected = false;
                            break;
                        case bitsObject.LEGENDS: //disable legends
                            $chartOptions.find(".chart-legends-chkbox").addClass("deactivated");
                            $chartOptions.find(".chart-legends-container").addClass("chart-disabled-option").off("click.toggleLegendsChkBox");
                            this.enableTab($chartOptions.find(".chart-legends-container").attr('id'), false);
                            chartOptionsData.chartLegendsSelected = false;
                            break;
                        case bitsObject.AXES_LINES: //disable axes lines
                            $chartOptions.find(".chart-axeslines-chkbox").addClass("deactivated");
                            $chartOptions.find(".chart-axeslines-container").addClass("chart-disabled-option").off("click.toggleAxesLinesChkBox");
                            this.enableTab($chartOptions.find(".chart-axeslines-container").attr('id'), false);
                            chartOptionsData.chartAxesLinesSelected = false;
                            break;
                        case bitsObject.AXES_LABELS: //disable axes labels
                            $chartOptions.find(".chart-axeslabels-chkbox").addClass("deactivated");
                            $chartOptions.find(".chart-axeslabels-container").addClass("chart-disabled-option").off("click.toggleAxesLabelsChkBox");
                            this.enableTab($chartOptions.find(".chart-axeslabels-container").attr('id'), false);
                            chartOptionsData.chartAxesLabelsSelected = false;
                            break;
                        default:
                            chartOptionsData = {
                                "chartTitleSelected": true,
                                "chartGridlinesSelected": true,
                                "chartLegendsSelected ": true,
                                "chartAxesLinesSelected": true,
                                "chartAxesLabelsSelected": true,
                                "chartAxesTitlesSelected": true
                            };
                            break;
                    }
                }
            }
            if (axesTitleFlag === true) {
                $chartOptions.find(".chart-axes-title-chkbox").addClass("deactivated");
                $chartOptions.find(".chart-axes-title-chkbox-container").off("click.toggleAxisTitleChkBox");
                chartOptionsData.chartAxesTitlesSelected = false;
                $chartOptions.find(".chart-axes-titles-container").addClass("chart-disabled-option");
                this.enableTab($chartOptions.find(".chart-axes-title-chkbox-container").attr('id'), false);
            }
            $chartOptions.find(".chart-title-textbox, .chart-x-axis-title-textbox, .chart-y-axis-title-textbox").val("");
            model.set("chartOptionsData", chartOptionsData);
            if (this.chartName === 'histogram' && this.spinnerView) {
                this.setDefaultValueForSpinner();
            }
        },
        "setChartPosition": function(topPosition, leftPosition, onlyModel) {
            this.model.set("chartPosition", {
                "top": topPosition,
                "left": leftPosition
            });
            if (onlyModel !== true) {
                this.$el.data('position', {
                    'top': topPosition,
                    'left': leftPosition
                }).css({
                    "top": topPosition,
                    "left": leftPosition
                });
            }
        },
        "_setChartOption": function(columnNo, tableView) {

            var chartOptionsData,
                legend,
                gridline,
                axisLine,
                axisLabel,
                chart,
                $chartOptions = this.$(".chart-options-container"),
                chartName,
                model = this.model,
                axisTitle;
            chart = model.get("chart");
            chartName = model.get("chartName");
            if (chartName !== "dot" && chartName !== "pie") {
                axisLabel = chart.xAxis.labels.enabled === true || chart.yAxis.labels.enabled === true;
            }
            legend = chart.legend.enabled === true;

            if (chartName !== "pie") {
                axisLine = chart.xAxis.lineWidth > 0 || chart.yAxis.lineWidth > 0;
                gridline = chart.xAxis.gridLineWidth > 0 || chart.yAxis.gridLineWidth > 0;
                axisTitle = true;
            } else {
                axisTitle = false;
            }
            chartOptionsData = {
                "chartTitleSelected": true,
                "chartAxesTitlesSelected": axisTitle,
                "chartGridlinesSelected": gridline,
                "chartLegendsSelected": legend,
                "chartAxesLinesSelected": axisLine,
                "chartAxesLabelsSelected": axisLabel,
                "chartTitle": null,
                "xAxisTitle": null,
                "yAxisTitle": null,
                "chartTable": null
            };
            model.set("chartOptionsData", chartOptionsData);
            this.setDefaultChecked($chartOptions, tableView);
        },

        "setChartData": function(chartData, tableView) {
            var $chartOptions,
                chartOptionsData = chartData.chartOptionsData,
                chartVisible,
                hiddenSeries,
                chartSize,
                chartName,
                chartPosition;
            if (!chartOptionsData) {
                return void 0;
            }
            $chartOptions = this.$(".chart-options-container");
            chartVisible = chartData.isVisible;
            chartSize = chartData.chartSize;
            chartName = this.options.chartName;
            chartPosition = chartData.chartPosition;
            hiddenSeries = chartOptionsData.hiddenSeries || chartData.hiddenSeries || chartData.hiddenSerises;
            // these checks have been added for old Json's.
            if (hiddenSeries) {
                this.model.set('hiddenSeries', hiddenSeries);
                this.hideLegendIndexes();
            }

            $chartOptions.find(".chart-title-chkbox").toggleClass("deactivated", chartOptionsData.chartTitleSelected !== true);
            $chartOptions.find(".chart-title-textbox").prop("disabled", chartOptionsData.chartTitleSelected !== true);

            this.enableTab($chartOptions.find(".chart-title-text").attr('id'), chartOptionsData.chartTitleSelected === true);
            if (chartOptionsData.chartAxesTitlesSelected) {
                $chartOptions.find(".chart-axes-title-chkbox").removeClass("deactivated");
                if (chartOptionsData.chartXaxisTitleSelected) {
                    $chartOptions.find(".chart-x-axis-title-textbox").prop("disabled", false);
                    this.enableTab($chartOptions.find(".chart-x-axis-title-text").attr('id'), true);
                }
                if (chartOptionsData.chartYaxisTitleSelected) {
                    $chartOptions.find(".chart-y-axis-title-textbox").prop("disabled", false);
                    this.enableTab($chartOptions.find(".chart-y-axis-title-text").attr('id'), true);
                }
            } else {
                $chartOptions.find(".chart-axes-title-chkbox").addClass("deactivated");
                $chartOptions.find(".chart-x-axis-title-textbox, .chart-y-axis-title-textbox").prop("disabled", true);
                this.enableTab($chartOptions.find(".chart-y-axis-title-text").attr('id'), false);
                this.enableTab($chartOptions.find(".chart-x-axis-title-text").attr('id'), false);
            }
            $chartOptions.find(".chart-gridlines-chkbox").toggleClass("deactivated", chartOptionsData.chartGridlinesSelected !== true);

            $chartOptions.find(".chart-legends-chkbox").toggleClass("deactivated", chartOptionsData.chartLegendsSelected !== true);

            $chartOptions.find(".chart-axeslines-chkbox").toggleClass("deactivated", chartOptionsData.chartAxesLinesSelected !== true);

            $chartOptions.find(".chart-axeslabels-chkbox").toggleClass("deactivated", chartOptionsData.chartAxesLabelsSelected !== true);
            switch (this.chartName) {
                case "box":
                    if (chartData.horizontalBoxPlot !== void 0) {
                        this._setRetrivedOrientation(chartData.horizontalBoxPlot);
                    }
                    break;
                case "histogram":
                    if (chartData.numberOfBins !== void 0) {
                        this.spinnerView.updateSpinValue(chartData.numberOfBins, true);
                    } else {
                        if (chartData.binSize !== void 0) {
                            this.spinnerView.updateSpinValue(chartData.binSize);
                        }
                    }
                    break;
            }
            this.model.set("chartOptionsData", chartOptionsData);
            if (chartSize) {
                this.setChartSize(chartSize);
            }
            if (chartPosition) {
                this.setChartPosition(chartPosition.top, chartPosition.left, false);
            }
            if (typeof chartData.zIndex !== "undefined") {
                this.$el.css({
                    "z-index": chartData.zIndex
                });
            }
            if (chartVisible === false) {
                this.trigger('hide-chart', this);
            }
            this._updateOptions(this.$el, chartName, true, tableView);
        },

        "setChartSize": function(chartSize) {
            var chartWidth, model = this.model,
                $legendData = this.$(".legends-data"),
                CHART_HEIGHT_PADDING = 30,
                chartResizeBtnHeight = 30,
                legendWidth, chartOptionsData = model.get("chartOptionsData");
            if (chartOptionsData.chartLegendsSelected) {
                chartWidth = model.get("chartWithLegends");
            } else {
                chartWidth = model.get("chartWithoutLegends");
            }
            legendWidth = 1 - chartWidth;
            this.$(".chart-window-highcharts-container").height(chartSize.chart.height).width(chartSize.chart.width);
            this.$(".charts").height(chartSize.chart.height).width(chartSize.chart.width * chartWidth);
            $legendData.height(chartSize.chart.height).width(chartSize.chart.width * legendWidth)
                .find(".legend-table").css("max-height", chartSize.chart.height - chartResizeBtnHeight - model.get("orientationOptionHeight") + "px");
            $legendData.find(".chart-box").css("max-height",
                chartSize.chart.height - CHART_HEIGHT_PADDING - chartResizeBtnHeight - model.get("orientationOptionHeight") + "px");
            $legendData.find(".charts-legends-container").css("max-height", chartSize.chart.height - CHART_HEIGHT_PADDING - chartResizeBtnHeight + "px");
            this.$(".chart-options-container").height(chartSize.chartOptions.height).width(chartSize.chartOptions.width).hide();
            this.model.set("chartSize", chartSize);
        },
        "setDefaultChecked": function($chartOptions, tableView) {
            var chartData = {
                "chartOptionsData": null,
                "chartSize": null,
                "chartPosition": null
            };
            chartData.chartOptionsData = this.model.get("chartOptionsData");
            chartData.chartSize = $.extend(true, {}, this.model.get("chartDefaultSize"));
            this.setChartData(chartData, tableView);
        },
        "getChartData": function() {
            var chartData = {
                    "chartOptionsData": null,
                    "chartSize": null,
                    "chartPosition": null
                },
                model = this.model;
            switch (this.chartName) {
                case 'box':
                    chartData.horizontalBoxPlot = model.get('horizontalBoxPlot');
                    break;
                case 'histogram':
                    chartData.binSize = model.get('bins');
                    break;
            }
            chartData.chartOptionsData = model.get("chartOptionsData");
            chartData.chartSize = model.get("chartSize");
            chartData.chartPosition = model.get("chartPosition");
            chartData.chartPosition.type = 'relative';
            chartData.zIndex = this.$el.css("z-index");
            chartData.chartOptionsData.hiddenSeries = model.get('hiddenSeries');
            chartData.isVisible = this.visible;
            return chartData;
        },
        "_setChartTitle": function(isCallFromSetData, columnNo, isLabel, rowHeader) {
            var model = this.model,
                $chartWindow = this.$el,
                chartName = this.chartName,
                isLatex = false,
                colNo = columnNo || 0,
                chartTitle,
                header = model.get("tableHeaders"),
                chartOptions = model.get("chartOptionsData"),
                chartTitleText = $chartWindow.find(".chart-title-textbox");
            if (chartOptions.chartTitleSelected === true) {
                if (isCallFromSetData === true && chartOptions.chartTitle !== "" && chartOptions.chartTitle !== null) {
                    chartTitleText.val(chartOptions.chartTitle);
                }
                if (chartTitleText.val() === "" || chartTitleText.val() === model.get("chartTitle")) {
                    if (["pie", "histogram", "dot"].indexOf(chartName) > -1 || ["bar", "column"].indexOf(chartName) > -1 && header.length === 1 && rowHeader) {
                        chartTitle = header[colNo];
                        isLatex = true;
                    } else {
                        chartTitle = model.get("chartTitle");
                    }
                } else {
                    chartTitle = chartTitleText.val();
                    chartOptions.chartTitle = chartTitle;
                }
            } else {
                chartTitle = "";
            }
            this._changeChartTitle(chartTitle, isLatex, isLabel);
            model.set("chartOptionsData", chartOptions);
        },
        "_updateOptions": function($chartWindow, chartName, isCallFromSetData, tableView) {

            var model = this.model,
                chartOptions = model.get("chartOptionsData"),
                xAxisTitleText,
                yAxisTitleText,
                rowHeader = tableView.getRowHeaderState(),
                headerDelta = rowHeader ? 1 : 0,
                colNo = Number(tableView._getColumnNo(this.$el.attr('data-column-cid'))),
                columnNo = Number(tableView._getOriginalColumnNo(colNo)) - 1,
                chartTitleText;
            if (this._supportedMulitpleCharts.indexOf(chartName) > -1) {
                columnNo -= headerDelta;
            }
            if (typeof $chartWindow === "undefined") {
                $chartWindow = this.$el;
                this.chartOptionsUpdated = true;
            }
            this._setChartTitle(isCallFromSetData, columnNo, false, rowHeader);
            chartTitleText = $chartWindow.find('.chart-title-textbox');
            xAxisTitleText = $chartWindow.find('.chart-x-axis-title-textbox');
            yAxisTitleText = $chartWindow.find('.chart-y-axis-title-textbox');
            if (isCallFromSetData === true) {
                yAxisTitleText.val(chartOptions.yAxisLabel);
                xAxisTitleText.val(chartOptions.xAxisLabel);
                chartTitleText.val(chartOptions.chartTitle);
            }
            if (chartOptions.xAxisLabel !== xAxisTitleText.val()) {
                chartOptions.xAxisLabel = xAxisTitleText.val();
                this.chartOptionsUpdated = true;
            }
            if (chartOptions.yAxisLabel !== yAxisTitleText.val()) {
                chartOptions.yAxisLabel = yAxisTitleText.val();
                this.chartOptionsUpdated = true;
            }
            model.set('chartOptionsData', chartOptions);
            if (chartOptions.chartAxesTitlesSelected === true) {
                if (chartOptions.xAxisLabel !== '') {
                    this.trigger('chart-x-axis-label-changed');

                }
                if (chartOptions.yAxisLabel !== '') {
                    this.trigger('chart-y-axis-label-changed');
                }
            }
            if (this.chartOptionsUpdated === true || isCallFromSetData === true) {
                this._applyHighChartSettings();
                this.chartOptionsUpdated = false;
            }
        },
        "_applyHighChartSettings": function(orientationChanged) {

            var model = this.model,
                chartOptions = model.get("chartOptionsData"),
                legendContainer,
                chartWithLegends = model.get("chartWithLegends"),
                chartWindow = this.$el,
                chartSize = this.model.get('chartSize').chart,
                chartName = this.chartName,
                temp,
                LIMIT = 3,
                xAxisLabel,
                yAxisLabel,
                lineWidth,
                gridLineWidth,
                chartSetting = model.CHART_SETTINGS,
                chart,
                xAxisTitleText = "",
                yAxisTitleText = "",
                xAxisTitle, chartWidth, chartHeight, $legendsData, $charts,
                yAxisTitle,
                MAX_LABEL_LENGTH = 12;
            legendContainer = chartWindow.find(".charts-legends-container");
            xAxisTitle = model.get("xAxisTitle");
            yAxisTitle = model.get("yAxisTitle");
            xAxisLabel = chartOptions.xAxisLabel;
            yAxisLabel = chartOptions.yAxisLabel;
            chart = model.get("chart");

            // causing error with multiple clicks on error chart
            if (chart === null) {
                return void 0;
            }
            if (chartName === "bar" || model.get("horizontalBoxPlot") === true) {
                temp = xAxisTitle;
                xAxisTitle = yAxisTitle;
                yAxisTitle = temp;
                temp = xAxisLabel;
                xAxisLabel = yAxisLabel;
                yAxisLabel = temp;
            }
            if (xAxisLabel && xAxisLabel !== "" && xAxisLabel.length > MAX_LABEL_LENGTH) {
                xAxisTitleText = xAxisLabel;
                xAxisLabel = xAxisLabel.substr(0, MAX_LABEL_LENGTH);
            } else if (xAxisLabel && xAxisLabel !== "") {
                xAxisTitleText = xAxisLabel;
            }
            if (yAxisLabel && yAxisLabel !== "" && yAxisLabel.length > MAX_LABEL_LENGTH) {
                yAxisTitleText = yAxisLabel;
                yAxisLabel = yAxisLabel.substr(0, MAX_LABEL_LENGTH);
            } else if (yAxisLabel && yAxisLabel !== "") {
                yAxisTitleText = yAxisLabel;
            }
            if (xAxisTitleText === "") {
                xAxisTitleText = xAxisTitle;
            }
            if (yAxisTitleText === "") {
                yAxisTitleText = yAxisTitle;
            }
            model.set({
                "currentXAxisTitle": xAxisTitleText,
                "currentYAxisTitle": yAxisTitleText
            });
            if (chartOptions.chartAxesTitlesSelected === true) {
                chart.xAxis.title = {
                    "text": xAxisLabel && xAxisLabel !== "" ? xAxisLabel : xAxisTitle
                };
                if (typeof chart.yAxis !== "undefined") {
                    chart.yAxis.title = {
                        "text": yAxisLabel || yAxisTitle
                    };
                }
            } else {
                chart.xAxis.title = {
                    "text": ""
                };
                if (typeof chart.yAxis !== "undefined") {
                    chart.yAxis.title = {
                        "text": ""
                    };
                }
            }
            $charts = chartWindow.find('.charts');
            $legendsData = chartWindow.find('.legends-data');
            chartHeight = chartSize.height;
            chartWidth = chartSize.width;
            $charts.height(chartHeight).width(chartWidth * chartWithLegends);
            $legendsData.height(chartHeight).width(chartWidth * (1 - chartWithLegends));

            if (chartOptions.chartLegendsSelected) {
                legendContainer.show();
                $charts.removeClass("legend-deselected");
                $legendsData.removeClass("legend-deselected");
                if (chartName === "box") {
                    chartWindow.find(".charts-legends-container").show();
                }
            } else {
                legendContainer.hide();
                $charts.addClass("legend-deselected");
                $legendsData.addClass("legend-deselected");
                if (['histogram', 'box'].indexOf(chartName) > -1) {
                    legendContainer.show();
                    $charts.removeClass('legend-deselected');
                    $legendsData.removeClass('legend-deselected');
                    legendContainer.hide();
                }
            }
            this._updateChartLegendSize();
            if (chartName !== "pie") {
                chart.xAxis.labels.enabled = chartOptions.chartAxesLabelsSelected;

                lineWidth = chartOptions.chartAxesLinesSelected === true ? chartSetting.LINE_WIDTH_2 : chartSetting.LINE_WIDTH_0;
                chart.xAxis.lineWidth = lineWidth;

                if (chartName === "dot") {
                    chart.xAxis.gridLineWidth = chartSetting.GRID_LINE_WIDTH_0;
                    chart.yAxis.gridLineWidth = chartSetting.GRID_LINE_WIDTH_0;
                } else {
                    gridLineWidth = chartOptions.chartGridlinesSelected === true ? chartSetting.GRID_LINE_WIDTH_1 : chartSetting.GRID_LINE_WIDTH_0;
                    chart.xAxis.gridLineWidth = gridLineWidth;
                    chart.yAxis.gridLineWidth = gridLineWidth;
                    chart.xAxis.tickWidth = gridLineWidth;
                    chart.yAxis.tickWidth = gridLineWidth;
                    chart.yAxis.lineWidth = lineWidth;
                    chart.yAxis.labels.enabled = chartOptions.chartAxesLabelsSelected;
                }
            }
            model.set("chart", chart);
            this._drawChart();
            this._bindAxisTitleTooltip();
        },
        "_changeChartTitle": function(newTitle, isLatex, isLabel) {
            var $title = this.$(".chart-title"),
                cid, equationText;

            if (isLatex === true) {
                $title.mathquill("editable").mathquill("revert").mathquill().mathquill("latex", newTitle)
                    .off("mousedown");
                $title.toggleClass("label-cell-italicized-function", isLabel === true)
                    .find(".non-italicized-function").toggleClass("label-cell-italicized-function", isLabel === true);
                cid = this.$el.attr('data-column-cid');
                equationText = this.equationPanelView._getEquationDataUsingCid(cid).getAccText();
                if (!equationText) {
                    equationText = newTitle;
                }
            } else {
                $title.html(newTitle);
                equationText = newTitle;
            }
            this.headerTitle = equationText;
            this.accManagerView.setAccMessage('chart-window-' + this.cid, this.accManagerView.getAccMessage('chart-acc-messages', 0, [equationText]));
            MathUtilities.Components.Utils.TouchSimulator.enableTouch($title);
            $title.off("mouseenter").on("mouseenter", _.bind(this._chartTitleMouseOver, this, $title, newTitle, isLatex))
                .off("mouseleave").on("mouseleave", _.bind(this._chartTitleMouseLeave, this))
                .off("mouseup").on("mouseup", _.bind(this._chartTitleMouseUp, this));
        },
        "_chartTitleMouseOver": function($chartTitle, latex, isLatex) {
            var actualLatex = isLatex ? latex.split(' ').join('\\text{ }') : latex,
                tooltipProperties = {
                    "element": $chartTitle,
                    "latex": actualLatex,
                    "isLatex": isLatex
                };
            this.trigger("show-tooltip", tooltipProperties);
        },
        "_chartTitleMouseLeave": function() {
            this.trigger("hide-tooltip");
        },
        "BITS_OBJECT": {
            "CHART_TITLE": 1,
            "CHART_X_AXIS_TITLE": 2,
            "CHART_Y_AXIS_TITLE": 3,
            "GRID_LINES": 4,
            "LEGENDS": 5,
            "AXES_LINES": 6,
            "AXES_LABELS": 7
        },
        "_drawChart": function() {
            var model = this.model,
                series,
                highChart = this.$(".charts"),
                chart = model.get("chart"),
                chartReplica;
            chartReplica = jQuery.extend(true, {}, chart);
            series = chartReplica.series;
            chartReplica.series = this._addSeries(series);
            highChart.highcharts(chartReplica);
            this.hideLegendIndexes();
        },
        "_addSeries": function(seriesArray) {
            var model = this.model,
                series, bestFit = model.get("bestFit");
            for (series in bestFit) {
                if (series) {
                    seriesArray.push(bestFit[series]);
                }
            }
            return seriesArray;
        },
        "_setRetrivedOrientation": function(horizontalBoxPlot) {
            var $target;
            if (horizontalBoxPlot) {
                $target = this.$(".horizontal-radio-btn .radio-btn-circle");
            } else {
                $target = this.$(".vertical-radio-btn .radio-btn-circle");
            }
            this._orientationRadioBtnClicked(false, $target);
        },
        /**
         * Show radio buttons for box axis orientation
         *
         * @method _showOrientionRadioBtns
         * @private
         */
        "_showOrientionRadioBtns": function() {
            var $orientationBtnHolder = this.$(".orientation-btns-holder"),
                legendContainerHeight = $orientationBtnHolder.parents(".legends-data").height();
            $orientationBtnHolder.show();
            this.$(".legend-table").css({
                "max-height": legendContainerHeight - this.model.get("orientationOptionHeight") + "px"
            });
            $orientationBtnHolder.find(".horizontal-radio-btn .radio-btn-label").html(this.accManagerView.getMessage('dummy-chart-text', 20));
            $orientationBtnHolder.find(".vertical-radio-btn .radio-btn-label").html(this.accManagerView.getMessage('dummy-chart-text', 21));
            $orientationBtnHolder.find(".radio-btn-dot").hide();
            $orientationBtnHolder.find(".clickable-area").addClass("click-enabled");
            $orientationBtnHolder.find(".horizontal-radio-btn .radio-btn-dot").show();
            $orientationBtnHolder.find(".horizontal-radio-btn .clickable-area").removeClass("click-enabled");
        },

        /**
         * Handle radio button click for bar orientation
         *
         * @method _orientationRadioBtnClicked
         * @param event {Object} click event object
         * @private
         */
        "_orientationRadioBtnClicked": function(event, target) {
            var $target = $(event.target),
                currentLegend,
                $parentTarget,
                data,
                $deselectedLegends,
                noOfDeselectedLegends,
                model = this.model,
                legendCounter,
                chart = model.get("chart"),
                newChart = {};
            $deselectedLegends = this.$(".chart-legend.deselected");
            if (event === false) {
                $target = target;
            }
            $parentTarget = $target.parents('.orientation-radio-btn');
            // Unselect and Enable all radio buttons
            this.$(".orientation-radio-btn").find(".radio-btn-dot").hide();
            this.$(".orientation-radio-btn").find(".clickable-area").addClass("click-enabled");

            // Select and Disable click for currently selected
            $parentTarget.find(".radio-btn-dot").show();
            $parentTarget.find(".clickable-area").removeClass("click-enabled");

            data = $parentTarget.attr("data");
            model.set("horizontalBoxPlot", data === "horizontal");
            newChart.chart = {};
            newChart.chart.inverted = data === "horizontal";
            chart = jQuery.extend(true, chart, newChart);
            model.set("chart", chart);
            this._applyHighChartSettings(true);
            noOfDeselectedLegends = $deselectedLegends.length;
            if (noOfDeselectedLegends !== 0) {
                for (legendCounter = 0; legendCounter < noOfDeselectedLegends; legendCounter++) {
                    currentLegend = this.$(".chart-legend[index-data='" + $deselectedLegends.eq(legendCounter).attr("index-data") + "']");
                    currentLegend.removeClass("deselected");
                    this._showHideSeries(false, currentLegend);
                    currentLegend.addClass("deselected");
                }
            }
            if ($parentTarget.find('.radio-btn-circle .acc-read-elem').length !== 0) {
                this.accManagerView.setFocus($parentTarget.find('.radio-btn-circle').attr('id'));
            }
        },

        "_createLocAccJson": function() {
            var object = {
                "id": "chart-screen-" + this.cid,
                "name": "chart-screen-" + this.cid,
                "elements": [{
                    "id": "chart-title-container-" + this.cid,
                    "accId": "chart-title-container-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 1,
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.model.get('chartTitle'),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-handle-" + this.cid,
                    "accId": "chart-handle-" + this.cid,
                    "type": "text",
                    "offsetTop": "-2",
                    "offsetLeft": "-2",
                    "tabIndex": this.startIndex + 17,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 2),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-options-button-" + this.cid,
                    "accId": "chart-options-button-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 1),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-close-button-" + this.cid,
                    "accId": "chart-close-button-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 19,
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 3),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-of-" + this.cid,
                    "accId": "chart-of-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 2,
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": "",
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "legend-table-of-" + this.cid,
                    "accId": "legend-table-of-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 2,
                    "offsetTop": "-1",
                    "offsetLeft": "-8",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 23),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "horizontal-radio-btn-" + this.cid,
                    "accId": "horizontal-radio-btn-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 2,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 27),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "vertical-radio-btn-" + this.cid,
                    "accId": "vertical-radio-btn-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 2,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 28),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": this.cid + "-title",
                    "accId": this.cid + "-title",
                    "type": "text",
                    "tabIndex": this.startIndex + 2,
                    "offsetTop": "-2",
                    "offsetLeft": "-2",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 29),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": this.cid + "-down-arrow",
                    "accId": this.cid + "-down-arrow",
                    "type": "text",
                    "tabIndex": this.startIndex + 2,
                    "offsetTop": "-2",
                    "offsetLeft": "-2",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 36),
                            "loc": ""
                        }
                    }, {
                        "id": "1",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 31),
                            "loc": ""
                        }
                    }, {
                        "id": "2",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 34),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": this.cid + "-up-arrow",
                    "accId": this.cid + "-up-arrow",
                    "type": "text",
                    "tabIndex": this.startIndex + 2,
                    "offsetTop": "-2",
                    "offsetLeft": "-2",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 35),
                            "loc": ""
                        }
                    }, {
                        "id": "1",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 32),
                            "loc": ""
                        }
                    }, {
                        "id": "2",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 33),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": this.cid + "-text",
                    "accId": this.cid + "-text",
                    "type": "text",
                    "tabIndex": this.startIndex + 2,
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": "",
                            "loc": ""
                        }
                    }]

                }]
            };
            var optionsObject = {
                "id": "chart-options-screen-" + this.cid,
                "name": "chart-options-screen-" + this.cid,
                "elements": [{
                    "id": "chart-title-chkbox-container-" + this.cid,
                    "accId": "chart-title-chkbox-container-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 4, [this.accManagerView.getAccMessage('checked-text', 0),
                                this.accManagerView.getAccMessage('table-equation-panel-messages', 6)
                            ]),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-textbox-" + this.cid,
                    "accId": "chart-textbox-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 5, ['']),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-axes-title-chkbox-" + this.cid,
                    "accId": "chart-axes-title-chkbox-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 6, [this.accManagerView.getAccMessage('checked-text', 0),
                                this.accManagerView.getAccMessage('table-equation-panel-messages', 6)
                            ]),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-x-textbox-" + this.cid,
                    "accId": "chart-x-textbox-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 7, ['']),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-y-textbox-" + this.cid,
                    "accId": "chart-y-textbox-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 8, ['']),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-gridlines-container-" + this.cid,
                    "accId": "chart-gridlines-container-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 9, [this.accManagerView.getAccMessage('checked-text', 0),
                                this.accManagerView.getAccMessage('hide-text', 0)
                            ]),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-legends-container-" + this.cid,
                    "accId": "chart-legends-container-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 10, [this.accManagerView.getAccMessage('checked-text', 0),
                                this.accManagerView.getAccMessage('hide-text', 0)
                            ]),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-axeslines-container-" + this.cid,
                    "accId": "chart-axeslines-container-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 11, [this.accManagerView.getAccMessage('checked-text', 0),
                                this.accManagerView.getAccMessage('hide-text', 0)
                            ]),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-axeslabels-container-" + this.cid,
                    "accId": "chart-axeslabels-container-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 12, [this.accManagerView.getAccMessage('checked-text', 0),
                                this.accManagerView.getAccMessage('hide-text', 0)
                            ]),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "table-drop-down-" + this.cid + "-combo-holder",
                    "accId": "table-drop-down-" + this.cid + "-combo-holder",
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "offsetTop": "-3",
                    "offsetLeft": "-3",
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 13),
                            "loc": ""
                        }
                    }]

                }]
            };
            var optionsObjectStatic = {
                "id": "chart-options-screen-static" + this.cid,
                "name": "chart-options-screen-static" + this.cid,
                "elements": [{
                    "id": "chart-window-" + this.cid,
                    "accId": "chart-window-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 1,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('chart-acc-messages', 0, [this.model.get('chartTitle')]),
                            "loc": ""
                        }
                    }]

                }, {
                    "id": "chart-title-label-" + this.cid,
                    "accId": "chart-title-label-" + this.cid,
                    "type": "text",
                    "tabIndex": -1,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": "",
                            "loc": this.accManagerView.getMessage('dummy-chart-text', 0)
                        }
                    }]

                }, {
                    "id": "chart-axes-title-label-" + this.cid,
                    "accId": "chart-axes-title-label-" + this.cid,
                    "type": "text",
                    "tabIndex": -1,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": "",
                            "loc": this.accManagerView.getMessage('dummy-chart-text', 1)
                        }
                    }]

                }, {
                    "id": "chart-gridlines-label-" + this.cid,
                    "accId": "chart-gridlines-label-" + this.cid,
                    "type": "text",
                    "tabIndex": -1,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": "",
                            "loc": this.accManagerView.getMessage('dummy-chart-text', 2)
                        }
                    }]

                }, {
                    "id": "chart-legends-label-" + this.cid,
                    "accId": "chart-legends-label-" + this.cid,
                    "type": "text",
                    "tabIndex": -1,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": "",
                            "loc": this.accManagerView.getMessage('dummy-chart-text', 3)
                        }
                    }]

                }, {
                    "id": "chart-axeslines-label-" + this.cid,
                    "accId": "chart-axeslines-label-" + this.cid,
                    "type": "text",
                    "tabIndex": -1,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": "",
                            "loc": this.accManagerView.getMessage('dummy-chart-text', 4)
                        }
                    }]

                }, {
                    "id": "chart-axeslabels-label-" + this.cid,
                    "accId": "chart-axeslabels-label-" + this.cid,
                    "type": "text",
                    "tabIndex": -1,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": "",
                            "loc": this.accManagerView.getMessage('dummy-chart-text', 5)
                        }
                    }]

                }, {
                    "id": "chart-table-selector-label-" + this.cid,
                    "accId": "chart-table-selector-label-" + this.cid,
                    "type": "text",
                    "tabIndex": this.startIndex + 18,
                    "messages": [{
                        "id": "0",
                        "isAccTextSame": false,
                        "message": {
                            "acc": this.accManagerView.getAccMessage('dummy-chart-text', 6),
                            "loc": this.accManagerView.getMessage('dummy-chart-text', 6)
                        }
                    }]

                }]
            };
            var legendObject = {
                "id": "chart-legends-screen" + this.cid,
                "name": "chart-legends-screen" + this.cid,
                "elements": []
            };
            var accData = [];
            accData.push(object, optionsObject, optionsObjectStatic, legendObject);
            this.accManagerView.model.parse(accData);
            this._addLegendElements();
            this.accManagerView.loadScreen('chart-options-screen-static' + this.cid);
        },

        "_addLegendElements": function(element) {
            var $legendItems = this.$(".charts-container .charts-legend"),
                legendItemsLength = $legendItems.length,
                counter, object, index,
                accData = this.accManagerView.model.nodes.get('chart-legends-screen' + this.cid);

            if (accData) {
                accData = accData.toJSON();

                if (element) {
                    var a = {
                        "id": element,
                        "accId": element,
                        "type": "text",
                        "tabIndex": this.lastIndex ? this.lastIndex + 1 : this.lastIndex = this.startIndex + 3,
                        "offsetTop": "-1",
                        "messages": [{
                            "id": "0",
                            "isAccTextSame": false,
                            "message": {
                                "acc": "",
                                "loc": ""
                            }
                        }]

                    };
                    accData.elements.push(a);
                } else {
                    var model = this.model,
                        labels,
                        headers,
                        chartName = this.chartName,
                        counter,
                        legendItemsLength,
                        legends = [];
                    accData.elements = [];
                    switch (chartName) {
                        case "bar":
                        case "column":
                        case "box":
                            headers = model.get("tableHeaders");
                            legends = headers;
                            break;
                        case "histogram":
                        case 'dot':
                            break;
                        case "pie":
                            labels = model.get("chartLabels");
                            legends = labels;
                            break;
                    }
                    legendItemsLength = legends.length;



                    for (counter = 0; counter < legendItemsLength; counter++) {
                        var a = {
                            "id": 'chart-legend-' + counter + '-' + this.cid,
                            "accId": 'chart-legend-' + counter + '-' + this.cid,
                            "type": "text",
                            "tabIndex": this.startIndex + 3 + counter,
                            "offsetTop": "-1",
                            "messages": [{
                                "id": "0",
                                "isAccTextSame": false,
                                "message": {
                                    "acc": "",
                                    "loc": ""
                                }
                            }]

                        };
                        accData.elements.push(a);

                    }
                    if (a) {
                        this.lastIndex = a.tabIndex;
                    }
                }
                this.accManagerView.model.parse([accData]);
            }
        },

        "_closeOptonsAndSetFocus": function(event) {
            var eventType = this.isEventTabOrShiftTab(event);
            if (eventType.isShiftTab) {
                this.$('.chart-options-button').trigger('click');
            }
        },

        "_closeOptionsOnCloseFocus": function() {
            var $chartWindow = this.$el,
                $chartOptions = $chartWindow.find(".chart-options-container");
            if ($chartOptions.hasClass("visible")) {
                this.$('.chart-options-button').trigger('click');
            }
        },

        "isEventTabOrShiftTab": function(event) {
            var code = event.keyCode || event.which,
                obj = {
                    'isShiftTab': false,
                    'isTab': false
                };

            if (code === 9) {
                if (event.shiftKey !== true) {
                    obj.isTab = true;
                } else {
                    obj.isShiftTab = true;
                }
            }
            return obj;
        },

        "enableTab": function(elementId, isEnabled) {
            this.accManagerView.enableTab(elementId, isEnabled);
        },

        "_loadScreenForChart": function(tableView, event) {
            var horizontalRadioBtnId = this.$('.horizontal-radio-btn .radio-btn-circle').attr('id'),
                verticalRadioBtnId = this.$('.vertical-radio-btn .radio-btn-circle').attr('id'),
                $chartBtn = tableView.$el.find('[data-chart-name="' + this.chartName + '"]');
            if (event.keyCode === 32 && ($(event.target).hasClass('chart-window') || $(event.target).parent().hasClass('chart-window'))) { // space key
                this.accManagerView.loadScreen('chart-screen-' + this.cid);
                this.accManagerView.loadScreen('chart-legends-screen' + this.cid);
                this.accManagerView.setAccMessage('chart-title-container-' + this.cid, this.headerTitle);
                this.accManagerView.setFocus('chart-title-container-' + this.cid);
                this._getChartAccText(tableView);
                this._getChartLengendsText();
                this.enableTab(verticalRadioBtnId, false);
                this.enableTab(horizontalRadioBtnId, false);
                if (this.$('.horizontal-radio-btn .radio-btn-dot').css('display') === 'none') {
                    this.accManagerView.enableTab(verticalRadioBtnId, true);
                } else {
                    this.accManagerView.enableTab(horizontalRadioBtnId, true);
                }
                if (this.chartName === 'histogram') {
                    this.accManagerView.setAccMessage(this.cid + '-text',
                        this.accManagerView.getAccMessage('chart-acc-messages', 30, [this.spinnerView.currentValue]));
                }
                this.accManagerView.changeAccMessage('table-drop-down-' + this.cid + '-combo-holder',
                    0, [this.accManagerView.getMessage('table-number-text', 0, [$('#' + 'table-drop-down-' + this.cid).val()])]);
            } else if (event.keyCode === 27) { //escape key
                this.accManagerView.setFocus('chart-window-' + this.cid);
                this.accManagerView.unloadScreen('chart-screen-' + this.cid);
                this.accManagerView.unloadScreen('chart-legends-screen' + this.cid);
            } else if (event.keyCode === 67) { //c character key
                if ($chartBtn.find('.acc-read-elem').length !== 0) {
                    this.accManagerView.setFocus($chartBtn.attr('id'));
                    this.accManagerView.unloadScreen('chart-screen-' + this.cid);
                    this.accManagerView.unloadScreen('chart-legends-screen' + this.cid);
                }
            }
        },

        "_unloadScreenForChart": function(type, event) {
            var eventType = this.isEventTabOrShiftTab(event),
                chartHeightAndWidth,
                $highChartContainer,
                directionX,
                directionY,
                $gridGraph,
                $template;
            if (type === 'title') {
                if (eventType.isShiftTab) {
                    this.accManagerView.unloadScreen('chart-screen-' + this.cid);
                    this.accManagerView.unloadScreen('chart-legends-screen' + this.cid);
                    this.accManagerView.setFocus('chart-window-' + this.cid);
                } else if ([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
                    switch (event.keyCode) {
                        case 37: //left arrow key
                            directionX = -1;
                            directionY = 0;
                            break;
                        case 38: //up arrow key
                            directionX = 0;
                            directionY = -1;
                            break;
                        case 39: //right arrow key
                            directionX = 1;
                            directionY = 0;
                            break;
                        case 40: //down arrow key
                            directionX = 0;
                            directionY = 1;
                            break;
                    }
                    $gridGraph = $('#grid-graph');
                    $template = $(event.target).parents('.chart-window');
                    $highChartContainer = $template.find('.chart-window-highcharts-container');
                    chartHeightAndWidth = this._chartDragStart($highChartContainer);
                    chartHeightAndWidth.ui = {
                        "position": {
                            "top": $template.position().top + directionY * 10,
                            "left": $template.position().left + directionX * 10
                        }
                    };
                    if (chartHeightAndWidth.ui.position.left < 2) {
                        chartHeightAndWidth.ui.position.left = 2;
                    } else if (chartHeightAndWidth.ui.position.left + $template.width() > $gridGraph.width()) {
                        chartHeightAndWidth.ui.position.left = $gridGraph.width() - $template.width();
                    }
                    if (chartHeightAndWidth.ui.position.top < 2) {
                        chartHeightAndWidth.ui.position.top = 2;
                    } else if (chartHeightAndWidth.ui.position.top + $template.height() > $gridGraph.height()) {
                        chartHeightAndWidth.ui.position.top = $gridGraph.height() - $template.height();
                    }
                    $template.css({
                        "top": chartHeightAndWidth.ui.position.top,
                        "left": chartHeightAndWidth.ui.position.left
                    });
                    this._chartDragStop($template, $('#grid-graph'), $highChartContainer, chartHeightAndWidth);

                }
            } else {
                if (eventType.isTab) {
                    this.accManagerView.unloadScreen('chart-screen-' + this.cid);
                    this.accManagerView.unloadScreen('chart-legends-screen' + this.cid);
                    this.accManagerView.setFocus('chart-window-' + this.cid);
                }
            }
        },

        "_getChartAccText": function(tableView) {
            var model = this.model,
                index, str = '',
                index1, chartLabels, chartYTitle, tableHeaders, plotData, chartData, currData, loopLength, header,
                tableHeadersAcc,
                chartName = this.chartName,
                bestFit = model.get('bestFit'),
                accManagerView, equationPanelView, chartView, parentTable,
                columnCid,
                hiddenSeries = model.get('hiddenSeries');
            tableHeaders = this.model.get('tableHeaders');
            tableHeadersAcc = this.model.get('tableHeadersAcc');
            switch (chartName) {
                case "bar":
                case "column":
                    chartLabels = this.model.get('chartLabels');
                    chartYTitle = this.model.get('currentXAxisTitle');
                    plotData = this.model.get('plotData');
                    loopLength = chartLabels.length;
                    for (index = 0; index < loopLength; index++) {
                        str += this.accManagerView.getAccMessage('chart-acc-messages', 14, [chartYTitle, chartLabels[index]]) + ' ';
                        for (index1 = 0; index1 < plotData.length; index1++) {
                            if (hiddenSeries.indexOf(index1) === -1) {
                                header = tableHeadersAcc[index1];
                                if (!header) {
                                    header = tableHeaders[index1];
                                }
                                str += this.accManagerView.getAccMessage('chart-acc-messages', 15, [header, plotData[index1][index]]);
                            }
                        }
                    }
                    break;
                case "box":
                    chartData = model.get('chartData').box;
                    loopLength = tableHeadersAcc.length;
                    for (index = 0; index < loopLength; index++) {
                        if (hiddenSeries.indexOf(index) === -1) {
                            currData = chartData[index];
                            header = tableHeadersAcc[index];
                            if (!header) {
                                header = tableHeaders[index];
                            }
                            if (currData) {
                                str += this.accManagerView.getAccMessage('chart-acc-messages', 19, [header, currData[4], currData[3], currData[2], currData[1], currData[0]]) + ' ';
                            }
                        }
                    }
                    break;
                case "histogram":
                    chartData = model.get('chartData');
                    loopLength = chartData.points.length;
                    for (index = 0; index < loopLength; index++) {
                        if (hiddenSeries.indexOf(index) === -1) {
                            currData = chartData.ranges[index].replace(/ /g, '').split('-');
                            str += this.accManagerView.getAccMessage('chart-acc-messages', 17, [currData[0], currData[1]]) + ' ' + this.accManagerView.getAccMessage('chart-acc-messages', 16, [chartData.points[index]]) + ' ';
                        }
                    }
                    break;
                case 'dot':
                    chartData = model.get('chartData');
                    loopLength = chartData.length;
                    for (index = 0; index < loopLength; index++) {
                        if (hiddenSeries.indexOf(index) === -1) {
                            currData = chartData[index];
                            str += this.accManagerView.getAccMessage('chart-acc-messages', 20, [currData.x]) + ' ' + this.accManagerView.getAccMessage('chart-acc-messages', 16, [currData.frequency]) + ' ';
                        }
                    }
                    break;
                case "pie":
                    chartData = model.get('chartData');
                    loopLength = chartData.length;
                    for (index = 0; index < loopLength; index++) {
                        if (hiddenSeries.indexOf(index) === -1) {
                            currData = chartData[index];
                            str += this.accManagerView.getAccMessage('chart-acc-messages', 18, [currData[0], currData[1]]) + ' ';
                        }
                    }
                    break;
            }
            chartLabels = this.model.get('chartLabels');
            accManagerView = this.accManagerView;
            equationPanelView = this.equationPanelView;
            parentTable = tableView;
            chartView = this;
            _.each(bestFit, function(object) {
                if (hiddenSeries.indexOf(chartView.$('.chart-legend').index(chartView.$el.find('[series-id="' + object.id + '"]'))) !== -1) {
                    return;
                }
                if (chartName !== 'box') {
                    columnCid = object.id.split('-')[1];
                    chartYTitle = equationPanelView._getEquationDataUsingCid(columnCid).getAccText();
                    if (!chartYTitle) {
                        chartYTitle = tableHeaders[parentTable._getColumnNo(columnCid) - 1];
                    }
                    str += accManagerView.getAccMessage('chart-acc-messages', 24, [object.name, chartYTitle]) + ' ';
                } else {
                    str += accManagerView.getAccMessage('chart-acc-messages', 26, [object.name, '']) + ' ';
                }
                switch (chartName) {
                    case "bar":
                    case "column":
                        loopLength = chartLabels.length;
                        for (index = 0; index < loopLength; index++) {
                            object.data[chartLabels[index]];
                            str += accManagerView.getAccMessage('chart-acc-messages', 25, [chartLabels[index], Number(object.data[chartLabels[index]][1].toFixed(2))]) + ' ';
                        }
                        break;
                    case "box":
                        chartData = object.data;
                        loopLength = tableHeadersAcc.length;
                        for (index = 0; index < loopLength; index++) {
                            header = tableHeadersAcc[index];
                            if (!header) {
                                header = tableHeaders[index];
                            }
                            str += accManagerView.getAccMessage('chart-acc-messages', 25, [header, Number(chartData[index + 1][1].toFixed(2))]) + ' ';
                        }
                        break;
                    case "histogram":
                        chartData = object.data;
                        loopLength = model.get('bins');
                        for (index = 0; index < loopLength; index++) {
                            str += accManagerView.getAccMessage('chart-acc-messages', 25, [index + 1, Number(chartData[index + 1][1].toFixed(2))]) + ' ';
                        }
                        break;
                    case "dot":
                        chartData = object.data;
                        loopLength = chartData.length;
                        for (index = 0; index < loopLength; index++) {
                            str += accManagerView.getAccMessage('chart-acc-messages', 25, [Number(chartData[index][0].toFixed(2)),
                                Number(chartData[index][1].toFixed(2))
                            ]) + ' ';
                        }
                        break;
                }
            });
            if (this.$('#chart-of-' + this.cid).find('.acc-read-elem').length !== 0) {
                this.accManagerView.setAccMessage('chart-of-' + this.cid, str);
            }
        },

        "_getChartLengendsText": function() {
            var model = this.model,
                index, str = '',
                $chartLegends,
                $currentLegend,
                bestFit, tableHeaders, loopLength, cid, accManagerView, chartLabels, legendName,
                tableHeadersAcc,
                noLegends = true,
                chartName = this.chartName;
            tableHeadersAcc = this.model.get('tableHeadersAcc');
            tableHeaders = this.model.get('tableHeaders');
            $chartLegends = this.$('.chart-legend');
            bestFit = model.get('bestFit');
            chartLabels = model.get('chartLabels');
            cid = this.cid;
            accManagerView = this.accManagerView;
            if ($chartLegends.length || !$.isEmptyObject(bestFit)) {
                if (this.$('.charts-legends-container').css('display') !== 'none') {
                    noLegends = false;
                }
            }
            if (chartName === 'pie') {
                loopLength = chartLabels.length;
            } else {
                loopLength = tableHeaders.length;
            }
            for (index = 0; index < loopLength; index++) {
                $currentLegend = $($chartLegends[index]);
                if (chartName === 'pie') {
                    legendName = chartLabels[index];
                } else {
                    legendName = tableHeadersAcc[index];
                    if (!legendName) {
                        legendName = tableHeaders[index];
                    }
                }
                if ($currentLegend.hasClass('deselected')) {
                    str = accManagerView.getAccMessage('chart-acc-messages', 21, [legendName, accManagerView.getAccMessage('unselected-text', 0),
                        accManagerView.getAccMessage('table-equation-panel-messages', 5)
                    ]);
                } else {
                    str = accManagerView.getAccMessage('chart-acc-messages', 21, [legendName, accManagerView.getAccMessage('selected-text', 0),
                        accManagerView.getAccMessage('table-equation-panel-messages', 6)
                    ]);
                }
                accManagerView.setAccMessage($currentLegend.attr('id'), str);
            }
            _.each(bestFit, function(object) {
                $currentLegend = $('#' + object.id + cid);
                if ($currentLegend.hasClass('deselected')) {
                    str = accManagerView.getAccMessage('chart-acc-messages', 21, [object.name, accManagerView.getAccMessage('unselected-text', 0),
                        accManagerView.getAccMessage('table-equation-panel-messages', 5)
                    ]);
                } else {
                    str = accManagerView.getAccMessage('chart-acc-messages', 21, [object.name, accManagerView.getAccMessage('selected-text', 0),
                        accManagerView.getAccMessage('table-equation-panel-messages', 6)
                    ]);
                }
                accManagerView.setAccMessage($currentLegend.attr('id'), str);
            });
            if (noLegends) {
                accManagerView.enableTab('legend-table-of-' + this.cid, false);
            } else {
                accManagerView.enableTab('legend-table-of-' + this.cid, true);
            }
        },

        "_updateSpinnerAcc": function(event) {
            var $target = $(event.currentTarget);
            if ($target.find('.acc-read-elem').length !== 0) {
                if ($target.hasClass('disabled')) {
                    this.accManagerView.changeAccMessage($target.attr('id'), 2);
                } else {
                    this.accManagerView.changeAccMessage($target.attr('id'), 1);
                }
                this.accManagerView.setFocus('dummy-focus-container');
                this.accManagerView.setFocus($target.attr('id'));
                if ($target.hasClass('spin-up-arrow')) {
                    this.accManagerView.changeAccMessage(this.$('.spin-down-arrow').attr('id'), 0);
                } else {
                    this.accManagerView.changeAccMessage(this.$('.spin-up-arrow').attr('id'), 0);
                }
                this.accManagerView.setAccMessage(this.cid + '-text',
                    this.accManagerView.getAccMessage('chart-acc-messages', 30, [this.spinnerView.currentValue]));
            }
        },

        "_setDefaultSpinnerAcc": function(event) {
            var $target = $(event.currentTarget);
            if ($target.find('.acc-read-elem').length !== 0) {
                if (!$target.hasClass('disabled')) {
                    this.accManagerView.changeAccMessage($target.attr('id'), 0);
                }
            }
        }
    });
})(window.MathUtilities);
