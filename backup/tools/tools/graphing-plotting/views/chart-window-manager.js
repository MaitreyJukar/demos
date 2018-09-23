/* globals $, _, window, Highcharts */

(function(MathUtilities) {
    "use strict";

    MathUtilities.Tools.Graphing.Views.ChartManager = Backbone.View.extend({


        "tableChartMappingObj": null,
        "tableViewsArray": null,
        "chartViewsArray": null,
        "totalChartNumber": null,
        "tableNameArray": null,
        "bestFitMapForCurve": null,
        "$chartContainer": null,
        "removedErrorChart": null,
        "graphingToolView": null,
        "customComboController": null,
        "DROP_DOWN_LINE_HEIGHT": 34,
        "DROP_DOWN_MAX_HEIGHT": 80,
        "tableNumbers": null,
        "tableIndex": null,
        "customComboArray": null,
        "bestFitObjects": null,
        "windowManagerView": null,
        "accManagerView": null,
        "comboCollection": null,
        "initialize": function() {
            var TOP_OFFSET = 40,
                DEFAULT_LEFT = 0,
                LEFT_OFFSET = 130,
                DEFAULT_TOP = 2;
            this.graphingToolView = this.options.graphingToolView;
            this.accManagerView = this.graphingToolView.accManagerView;
            this.tableChartMappingObj = {};
            this.chartViewsArray = [];
            this.tableViewsArray = [];
            this.tableNameArray = [];
            this.customComboArray = [];
            this.bestFitObjects = {};
            this.tableNumbers = [];
            this.tableIndex = [];
            this.comboCollection = {};
            this.totalChartNumber = 0;
            this.$el = this.graphingToolView.$el;
            this.bestFitMapForCurve = {
                "curve2": "Quadratic",
                "curve3": "Cubic",
                "curve4": "Quartic",
                "curve5": "Quintic",
                "curve6": "Sextic",
                "curve7": "Septic"
            };
            this.$chartContainer = this.options.container;
            this._createCustomComboboxes(this.$chartContainer);
            this.windowManagerView = new MathUtilities.Tools.Graphing.Views.WindowManager({
                "initialZindex": 1,
                "container": this.$chartContainer,
                "topOffset": TOP_OFFSET,
                "defaultLeft": DEFAULT_LEFT,
                "leftOffset": LEFT_OFFSET,
                "defaultTop": DEFAULT_TOP,
                "accManagerView": this.accManagerView
            });
            this.on("table-created", _.bind(function(tableView) {
                this._createTableChartObj(tableView);
            }, this));
            this.graphingToolView.on("show-equation-panel", _.bind(function() {
                    this._updateDraggableContainment(false);
                }, this))
                .on("hide-equation-panel", _.bind(function() {
                    this._updateDraggableContainment(true);
                }, this))
                .on("animate-chart-unchecked", this.disableAnimation)
                .on("animate-chart-checked", this.enableAnimation);
            this.disableAnimation();
            this._decimalTooltipLimit();

        },
        "events": {
            "mouseenter .chart-table-selector-options, .chart-table-selector-options-left, .chart-table-selector-options-right": "chartTableDropDownHover",
            "mouseleave .chart-table-selector-options, .chart-table-selector-options-left, .chart-table-selector-options-right": "chartTableDropDownLeave",
            "mousedown .chart-table-selector-options, .chart-table-selector-options-left, .chart-table-selector-options-right": "chartTableDropDownDown",
            "mouseup .chart-table-selector-options, .chart-table-selector-options-left, .chart-table-selector-options-right": "chartTableDropDownUp"
        },
        "_decimalTooltipLimit": function() {
            var styleObj = {
                "fontFamily": "Noto-Sans-Regular",
                "fontWeight": "bold"
            };
            Highcharts.setOptions({
                "chart": {
                    "style": styleObj
                },
                "xAxis": {
                    "title": {
                        "style": styleObj
                    }
                },
                "yAxis": {
                    "title": {
                        "style": styleObj
                    }
                }
            });
        },

        "_getTableVIewUsingChart": function(chartView) {
            var tableCounter,
                chartObj,
                tableView = null,
                tableFunction = _.bind(function(value) {
                    if (value && value.cid === chartView.cid) {
                        tableView = this.getTableViewFromCid(tableCounter);
                        return tableView;
                    }
                }, this);
            for (tableCounter in this.tableChartMappingObj) {
                chartObj = this.tableChartMappingObj[tableCounter][chartView.chartName].view;
                _.each(chartObj, tableFunction);
                if (tableView !== null) {
                    return tableView;
                }
            }
        },

        "_createTableChartObj": function(tableView) {
            var chartDataObj = {

                    "bar": {
                        "visible": null,
                        "isSelected": null,
                        "view": {}
                    },
                    "column": {
                        "visible": null,
                        "isSelected": null,
                        "view": {}
                    },
                    "box": {
                        "visible": null,
                        "isSelected": null,
                        "view": {}
                    },
                    "dot": {
                        "visible": null,
                        "isSelected": null,
                        "view": {}
                    },
                    "histogram": {
                        "visible": null,
                        "isSelected": null,
                        "view": {}
                    },
                    "pie": {
                        "visible": null,
                        "isSelected": null,
                        "view": {}
                    }
                },
                tableViewCid = tableView.cid,
                chartObjView, tabIndex, $chart, chartLength, index,
                chartObj;
            this.tableViewsArray.push(tableView);
            this.tableChartMappingObj[tableViewCid] = chartDataObj;
            this.tableNameArray.push(tableView.tableCounter);
            this._addTableOptionToDropDown(tableView.tableCounter, tableViewCid);
            tableView.off('chart-btn-clicked').on('chart-btn-clicked', _.bind(function(chartName, closeOptions) {
                    var objParam = {
                        "tableView": tableView,
                        "isUndoRedoAction": false,
                        "chartName": chartName
                    };
                    if (closeOptions) {
                        objParam.isChartVisible = closeOptions.isChartVisible;
                        objParam.currentTarget = closeOptions.currentTarget;
                    }
                    this._chartHandler(objParam);
                }, this))
                .off("table-hidden").on("table-hidden", _.bind(function() {
                    this._tableHiddenHandler(tableView);
                }, this))
                .off("table-shown").on("table-shown", _.bind(function() {
                    this._tableShownHandler(tableView);
                }, this))
                .off("delete-table").on("delete-table", _.bind(function() {
                    this._deleteTableChart(tableView);
                }, this))
                .off("data-changed").on("data-changed", _.bind(function(colNo, isUndoRedoAction) {
                    this._updateAllChartsForTable(tableView, colNo, isUndoRedoAction);
                }, this))
                .off("draw-best-fit-chart").on("draw-best-fit-chart", _.bind(this._drawBestFitChart, this, tableView))
                .off("color-changed").on("color-changed", _.bind(function() {
                    this._updateAllChartsForTable(tableView);
                }, this))
                .off("set-best-fit-deselected").on("set-best-fit-deselected", _.bind(this._hideBestFit, this, tableView))
                .off("line-chart-clicked").on("line-chart-clicked", _.bind(function(isSelected) {
                    this._lineChartClicked(tableView, isSelected);
                }, this))
                .off("table-removed").on("table-removed", _.bind(function() {
                    this._deleteTableChart(tableView);
                }, this))
                .off('table-plot-column-unchecked').on('table-plot-column-unchecked', _.bind(function(cid, isUndoRedoAction) {
                    this._plotColumnHidden(tableView, cid, isUndoRedoAction);
                }, this))
                .off('table-plot-column-checked').on('table-plot-column-checked', _.bind(function(cid, isUndoRedoAction, showBestFit) {
                    this._plotColumnShown(tableView, cid, isUndoRedoAction, showBestFit);
                }, this))
                .off('update-hidden-series').on('update-hidden-series', _.bind(function(isRowHeaderChecked) {
                    this._updateHiddenSeries(tableView, isRowHeaderChecked);
                }, this))
                .off('chart-shortcut-keypress').on('chart-shortcut-keypress', _.bind(function(chartName) {
                    chartObj = this.tableChartMappingObj[tableViewCid][chartName];
                    chartObjView = null;
                    tabIndex = 0;
                    _.each(chartObj.view, _.bind(function(value, index) {
                        if (value.$el.css('z-index') > tabIndex) {
                            tabIndex = Number(value.$el.css('z-index'));
                            chartObjView = value;
                        }
                    }, this));
                    if (chartObjView) {
                        this.accManagerView.setFocus(chartObjView.$el.attr('id'));
                    }


                    $chart = this.$('.chart-window');
                    chartLength = $chart.length;
                    for (index = 0; index < chartLength; index++) {
                        this.accManagerView.enableTab($($chart[index]).attr('id'), true);
                    }
                    this.accManagerView.enableTab('grid-graph-canvas-acc-container', true);
                    this.accManagerView.enableTab('grid-graph-container', false);
                }, this));
        },

        "_drawBestFit": function(tableView, seriesId, arr, color) {
            var chartDataObj = this.tableChartMappingObj[tableView.cid],
                chart,
                bestFitFunction = function(value) {
                    value.updateOrAddBestFit(seriesId, arr, color);
                };

            for (chart in chartDataObj) {
                if (chart !== "pie" && typeof chart !== "undefined") {
                    if (chartDataObj[chart].isSelected) {
                        _.each(chartDataObj[chart].view, bestFitFunction);
                    }
                }
            }
        },

        "_drawBestFitChart": function(tableView, type, subType, cid, notPlottedOnGraph, colNo) {
            var tableViewCid = tableView.cid,
                tableModel = tableView.model,
                bestFitCounter = tableModel.get('boxBestFitCounters'),
                chartDataObj = this.tableChartMappingObj[tableViewCid],
                chart,
                options = {
                    "type": type,
                    "subType": subType,
                    "tableView": tableView,
                    "cid": cid
                };
            options.chart = 'bestFit';
            if (!(this.totalChartNumber === 0 && notPlottedOnGraph === true)) {
                this._calculateBestFit(options);
            }
            options.notPlottedOnGraph = notPlottedOnGraph;
            for (chart in chartDataObj) {
                options.chart = chart;
                switch (chart) {
                    case 'column':
                    case 'bar':
                        if (chartDataObj[chart].isSelected) {
                            options.chartView = chartDataObj[chart].view[tableView._getColumnCid(1)];
                            this._calculateBestFit(options);
                        }
                        break;
                    case 'histogram':
                        if (chartDataObj[chart].isSelected) {
                            options.chartView = chartDataObj[chart].view[cid];
                            if (options.chartView) {
                                this._calculateBestFit(options);
                            }
                        }
                        break;
                    case 'dot':
                        if (chartDataObj[chart].isSelected) {
                            options.chartView = chartDataObj[chart].view[cid];
                            if (options.chartView) {
                                this._calculateBestFit(options);
                            }
                        }
                        break;
                }
            }
            if (subType) {
                if (bestFitCounter[subType]) {
                    bestFitCounter[subType]++;
                } else {
                    bestFitCounter[subType] = 1;
                }
            } else {
                if (bestFitCounter[type]) {
                    bestFitCounter[type]++;
                } else {
                    bestFitCounter[type] = 1;
                }
            }
        },
        "_calculateBestFit": function(options) {

            var type = options.type,
                subType = options.subType,
                tableView = options.tableView,
                cid = options.cid,
                chart = options.chart,
                chartView = options.chartView,
                notPlottedOnGraph = options.notPlottedOnGraph,
                colNo, plotted = false,
                columnData, columnData1,
                loopVar,
                points = [],
                colLength, dataCid = cid,
                boxData, count = 1,
                boxDataLength,
                isIntermediateCall = false,
                blankValueCount = 0,
                bestFitData, equationPanel = this.graphingToolView._equationPanel,
                tableModel = tableView.model,
                bestFitCounter = tableModel.get("boxBestFitCounters"),
                chartBestFit = tableModel.get("chartBestFit"),
                color,
                graphingToolModel = equationPanel.model,
                equationData = equationPanel._getEquationDataUsingCid(cid),
                chartProp,
                chartName = chart,
                addToChart = true,
                actualColNo,
                ignoreCharts = ["pie", "column"];
            colNo = tableView._getColumnNo(cid);

            if (colNo === void 0) {
                return void 0;
            }
            actualColNo = tableView._getOriginalColumnNo(colNo);
            if (chart === 'bestFit' || notPlottedOnGraph === true || notPlottedOnGraph === void 0) {
                isIntermediateCall = true;
            }
            color = tableModel.get("columnColors")[colNo - 1];
            if (chart === "column") {
                chart = "bar";
            }
            if (!chartBestFit[chart] && ignoreCharts.indexOf(chart) === -1) {
                chartBestFit[chart] = {};
            }
            if (!chartBestFit[chart][cid]) {
                chartBestFit[chart][cid] = {};
            }
            if (chart !== "box") {
                if (chart === "bestFit" || chart === "bar" || chart === "column") {
                    columnData = tableView.getTableColumnData(colNo).slice();
                    columnData.splice(0, 1);
                } else {
                    if (chart === 'dot') {
                        columnData1 = tableModel.get('dotChartData')[actualColNo][1];
                        columnData = tableModel.get('dotChartData')[actualColNo][0];
                    } else {
                        columnData = tableModel.get('histogramData')[actualColNo].points;
                    }
                }
                colLength = columnData.length;

                for (loopVar = 0; loopVar < colLength; loopVar++) {
                    if (["dot", "histogram"].indexOf(chart) > -1) {
                        if (columnData[loopVar] !== "") {
                            if (chart === "dot") {
                                points.push([columnData[loopVar], columnData1[loopVar]]);
                            } else {
                                points.push([count, columnData[loopVar]]);
                                count++;
                            }
                        }
                    } else if (isFinite(Number(columnData[loopVar]))) {
                        if (columnData[loopVar] === "") {
                            blankValueCount++;
                        }
                        points.push([loopVar + 1, Number(columnData[loopVar])]);
                    }

                }
            }
            chartProp = {};
            if (colLength === blankValueCount) {
                tableModel.set('chartBestFit', chartBestFit);
                return void 0;
            }
            if (chartView && !isIntermediateCall) {
                chartProp.chartName = chartView.model.get("defaultNameTitleMap")[chartName];
            }
            if (tableView.model.get('plotColumnHidden').indexOf(options.cid) !== -1) {
                addToChart = false;
            }
            switch (type) {
                case "line":
                    bestFitData = graphingToolModel._getBestFitLine(points, isIntermediateCall, false, chartProp);
                    if (bestFitData) {
                        if (chartView && addToChart) {
                            this._addBestFitToChart(chartView, bestFitData, points, cid, color, false, 'line');
                            plotted = true;
                        }
                        chartBestFit[chart][cid] = tableView.setBestFitOthers("line", chartBestFit[chart][cid], points);
                    }
                    break;
                case "curve":
                    bestFitData = graphingToolModel._getBestFitCurve(points, subType, isIntermediateCall, chartProp);
                    if (bestFitData) {
                        if (chartView && addToChart) {
                            this._addBestFitToChart(chartView, bestFitData, points, cid, color, false, 'curve', subType);
                            plotted = true;
                        }
                        chartBestFit[chart][cid] = tableView.setBestFitCurves("curve", subType, chartBestFit[chart][cid], points);
                    }
                    break;
                case "exp":
                    bestFitData = graphingToolModel._getBestFitExp(points, isIntermediateCall, chartProp);
                    if (bestFitData && addToChart) {
                        if (chartView) {
                            this._addBestFitToChart(chartView, bestFitData, points, cid, color, false, "exp");
                            plotted = true;
                        }
                        chartBestFit[chart][cid] = tableView.setBestFitOthers("exp", chartBestFit[chart][cid], points);
                    }
                    break;
                case "polynomial":
                     bestFitData = graphingToolModel._getBestFitPolynomial({
                         "points": points,
                         "isIntermediateCall": isIntermediateCall,
                         "parentEquation": equationData,
                         "chartProp": chartProp
                     });
                     if (bestFitData && addToChart) {
                         if (chartView) {
                             this._addBestFitToChart(chartView, bestFitData, points, cid, color, false, "polynomial");
                             plotted = true;
                         }
                         chartBestFit[chart][cid] = tableView.setBestFitOthers("polynomial", chartBestFit[chart][cid], points);
                     }
                    break;
            }
            if (plotted === true) {
                if (!chartBestFit.bestFit[dataCid][type]) {
                    chartBestFit.bestFit[dataCid] = chartBestFit[chart][cid];
                }
                cid = dataCid;
                equationPanel.trigger("set-best-fit-option-selected", tableView, cid, type, subType);
            }
            if (!(chartBestFit.bestFit[dataCid][type] || chartBestFit[chart][cid][type])) {
                if (subType) {
                    bestFitCounter[subType]--;
                } else {
                    bestFitCounter[type]--;
                }
            }
            tableModel.set("chartBestFit", chartBestFit);
        },
        "_lineChartClicked": function(tableView, isSelected) {
            var undoRedoData = {},
                undoData = {},
                redoData = {},
                $list = this.getListFromTableView(tableView),
                equationDataCid = $list.attr("data-equation-cid");
            undoData.chartName = "line";
            undoData.equationCid = equationDataCid;
            redoData.chartName = "line";
            redoData.equationCid = equationDataCid;
            undoRedoData.undo = undoData;
            undoRedoData.redo = redoData;
            if (isSelected === true) {
                undoData.actionType = "hideChart";
                redoData.actionType = "showChart";
            } else {
                redoData.actionType = "hideChart";
                undoData.actionType = "showChart";
            }
            this.graphingToolView.execute("showHideChart", undoRedoData);
        },
        "isDataValid": function(chartName, tableView, tableContents) {

            var chartObj = this.tableChartMappingObj[tableView.cid][chartName];
            if (chartName === "histogram") {

                if (tableContents.points.length < 2) {
                    tableView.deselectChartButton(chartName);
                    if (chartObj.isSelected === true) {
                        _.each(chartObj.view, _.bind(function(value, index) {
                            this._removeErrorChart(value, tableView, chartName);
                        }, this));
                    }
                    tableView.trigger("histogram-calculation-error");
                    return false;
                }
            }
            return true;
        },
        "getPoints": function(colNo, tableView) {
            var data, dataLength, loopVar, points = [],
                blankValueCount = 0;
            data = tableView.getTableColumnData(colNo).slice(1);
            dataLength = data.length;
            for (loopVar = 0; loopVar < dataLength; loopVar++) {
                if (isFinite(Number(data[loopVar]))) {
                    if (data[loopVar] === "") {
                        blankValueCount++;
                    }
                    points.push([loopVar + 1, data[loopVar]]);
                } else {
                    points.push([loopVar, ""]);
                }
            }
            if (blankValueCount === dataLength) {
                points = [];
            }
            return points;
        },
        "_updateOrAddBestFitToChart": function(tableView, chartView, chartName, isUpdate, dontPlot) {
            var tableModel = tableView.model,
                columnBestFit,
                colNo,
                data, boxData, boxDataLength,
                points = [],
                loopVar,
                count = 1,
                dataLength,
                cid,
                equationPanel = this.graphingToolView._equationPanel,
                equationPanelModel = equationPanel.model,
                chartProp = {},
                ignoreCharts = ['pie'],
                chartBestFit = tableModel.get('chartBestFit'),
                bestFitBar = {},
                options = {
                    "tableView": tableView,
                    "chartView": chartView,
                    "isUpdate": isUpdate
                },
                plotColumnHidden = null,
                currValue,
                index = null,
                columnNo = tableView._getOriginalColumnNo(chartView.model.get('columnNo'));
            bestFitBar = $.extend(bestFitBar, chartBestFit.bestFit);
            plotColumnHidden = tableModel.get('plotColumnHidden');
            chartProp.chartName = chartView.model.get('defaultNameTitleMap')[chartView.chartName];
            for (index = 0; index < plotColumnHidden.length; index++) {
                currValue = bestFitBar[plotColumnHidden[index]];
                if (typeof currValue !== 'undefined') {
                    delete bestFitBar[plotColumnHidden[index]];
                }
            }
            chartView.model.set('bestFit', {});
            if (!bestFitBar) {
                if (!dontPlot) {
                    chartView._drawChart();
                }
                return void 0;
            }
            if (!chartBestFit[chartName] && ignoreCharts.indexOf(chartName) === -1) {
                if (chartName === "column") {
                    chartBestFit.bar = {};
                } else {
                    chartBestFit[chartName] = {};
                }
            }
            switch (chartName) {
                case "column":
                case "bar":
                    for (columnBestFit in bestFitBar) {
                        colNo = tableView._getColumnNo(columnBestFit);
                        if (typeof colNo === "undefined") {
                            chartView.trigger('best-fits-updated');
                            return void 0;
                        }
                        points = this.getPoints(colNo, tableView);
                        if (points.length > 0) {
                            options.bestFit = bestFitBar[columnBestFit];
                            options.points = points;
                            options.cid = columnBestFit;
                            chartBestFit.bar[columnBestFit] = this._calculateAndPlotBestFit(options);
                        }
                    }
                    break;
                case 'histogram':
                    data = tableModel.get('histogramData')[columnNo].points;
                    dataLength = data.length;
                    for (loopVar = 0; loopVar < dataLength; loopVar++) {
                        if (data[loopVar] !== '') {
                            points.push([count, data[loopVar]]);
                            count++;
                        }
                    }
                    cid = tableView._getColumnCid(columnNo);
                    if (bestFitBar && points.length > 1) {
                        options.bestFit = bestFitBar[cid];
                        options.points = points;
                        options.cid = cid;
                        chartBestFit[chartName][cid] = this._calculateAndPlotBestFit(options);
                    }
                    break;
                case 'dot':
                    data = tableModel.get('dotChartData')[columnNo];
                    dataLength = data[0].length;
                    for (loopVar = 0; loopVar < dataLength; loopVar++) {
                        if (data[loopVar] !== "") {
                            points.push([data[0][loopVar], data[1][loopVar]]);
                        }
                    }
                    cid = tableView._getColumnCid(columnNo);
                    if (bestFitBar && points.length > 1) {
                        options.bestFit = bestFitBar[cid];
                        options.points = points;
                        options.cid = cid;
                        chartBestFit[chartName][cid] = this._calculateAndPlotBestFit(options);
                    } else if (points.length === 1 && bestFitBar && bestFitBar[cid]) {
                        chartProp = equationPanelModel.get('ERROR_STRINGS').TABLE_ERRORS._BEST_FIT_CHART_CURVE_STRING + chartProp.chartName;
                        equationPanelModel.trigger('best-fit-line-alert', chartProp);
                    }
                    break;
                case "box":
                    boxData = tableModel.get("boxAndWhiskerData").points;
                    boxDataLength = boxData.length;
                    for (loopVar = 0; loopVar < boxDataLength; loopVar++) {
                        points.push([count, boxData[loopVar]]);
                        count++;
                    }
                    count = 0;
                    break;
            }
            if (!dontPlot) {
                chartView.trigger('best-fits-updated');
            }
            tableModel.set('chartBestFit', chartBestFit);
        },
        "calculatePoints": function(data) {

            var degree = data.degree,
                range = data.range,
                coef = data.coef,
                step,
                mathHelper = MathUtilities.Components.Utils.Models.MathHelper,
                currentX = range.min.x,
                maxX = range.max.x,
                points = [],
                dataPoints = data.points,
                datalength,
                solution,
                NUMBER_PRECISION = 12,
                counter,
                dataCounter,
                coefCounter,
                solvePolynomial,
                solveExp;
            step = 1;
            solvePolynomial = function(x) {
                solution = 0;
                coefCounter = 1;
                for (counter = degree; counter >= 0; counter--, coefCounter++) {
                    solution += Math.pow(x, counter) * mathHelper._generateNumberFromLatex(coef[coefCounter - 1]);
                }
                return solution;
            };
            solveExp = function(x) {
                solution = mathHelper._generateNumberFromLatex(coef[0]) * Math.pow(mathHelper._generateNumberFromLatex(coef[1]), x);
                return solution;
            };
            if (dataPoints) {
                datalength = dataPoints.length;
            }
            if (degree === 'e') {
                if (datalength) {
                    for (dataCounter = 0; dataCounter < datalength; dataCounter++) {
                        currentX = dataPoints[dataCounter][0];
                        points.push([currentX, Number(solveExp(currentX).toPrecision(NUMBER_PRECISION))]);
                    }
                } else {
                    while (currentX < maxX) {
                        points.push([currentX, Number(solveExp(currentX).toPrecision(NUMBER_PRECISION))]);
                        currentX += step;
                    }
                    points.push([currentX, Number(solveExp(maxX).toPrecision(NUMBER_PRECISION))]);
                }
            } else {
                if (datalength) {
                    for (dataCounter = 0; dataCounter < datalength; dataCounter++) {
                        currentX = dataPoints[dataCounter][0];
                        points.push([currentX, Number(solvePolynomial(currentX + 1).toPrecision(NUMBER_PRECISION))]);
                    }
                } else {
                    while (currentX < maxX) {
                        points.push([currentX, Number(solvePolynomial(currentX + 1).toPrecision(NUMBER_PRECISION))]);
                        currentX += step;
                    }
                    points.push([currentX, Number(solvePolynomial(maxX + 1).toPrecision(NUMBER_PRECISION))]);
                }
            }
            return points;
        },

        "_addBestFitToChart": function(chartView, bestFitData, points, cid, color, isUpdate, type, subType) {

            var seriesId, pointLength = points.length,
                EquationPanel = MathUtilities.Tools.Graphing.Models.EquationPanel,
                data, maxX, name, minX,
                options;
            if (!subType) {
                subType = "";
            }
            if (chartView.chartName === "dot") {
                maxX = points[pointLength - 1][0];
                minX = points[0][0];
            } else {
                minX = 0;
                maxX = pointLength - 1;
            }
            name = type + subType + "";

            name = EquationPanel.bestFitMapForText[name];

            if (chartView.chartName === "box") {
                seriesId = type + subType + "";
                color = "#e65050";
            } else {
                seriesId = type + subType + "-" + cid;
            }
            options = {
                "degree": bestFitData.degree,
                "coef": bestFitData.coef,
                "range": {
                    "min": {
                        "x": minX - 1
                    },
                    "max": {
                        "x": maxX + 1
                    }
                }
            };
            if (chartView.chartName === 'dot') {
                options.points = points;
            }
            data = this.calculatePoints(options);
            chartView.updateOrAddSeries(seriesId, data, color, name, bestFitData.solutionString, isUpdate);
        },
        "getMaxY": function(points) {
            var max = points[0][1],
                loopVar, pointLength = points.length,
                yValue;
            for (loopVar = 1; loopVar < pointLength; loopVar++) {
                yValue = points[loopVar][1];
                if (max < yValue) {
                    max = yValue;
                }
            }
            return max;
        },

        "_calculateAndPlotBestFit": function(options) {
            var bestFit = options.bestFit,
                chartView = options.chartView,
                points = options.points,
                tableView = options.tableView,
                cid = options.cid,
                isUpdate = options.isUpdate,
                bestFitData, equationPanel = this.graphingToolView._equationPanel,
                graphingToolModel = equationPanel.model,
                value,
                tableModel = tableView.model,
                equationData = equationPanel._getEquationDataUsingCid(cid),
                colNo,
                chartProp = {},
                color;
            if (points.length < 2) {
                return void 0;
            }
            if (chartView.chartName !== "box") {
                colNo = tableView._getColumnNo(cid);
                if (typeof colNo === "undefined") {
                    return void 0;
                }
                color = tableModel.get("columnColors")[colNo - 1];
            }
            chartProp.chartName = chartView.model.get("defaultNameTitleMap")[chartView.chartName];
            if (bestFit) {
                if (bestFit.line && bestFit.line.selected === true) {
                    bestFitData = graphingToolModel._getBestFitLine(points, isUpdate, false, chartProp);
                    if (bestFitData) {
                        this._addBestFitToChart(chartView, bestFitData, points, cid, color, true, "line");
                        bestFit = tableView.setBestFitOthers('line', bestFit, points);
                        equationPanel.trigger('set-best-fit-option-selected', tableView, cid, 'line');
                    }

                }
                if (bestFit.curve) {
                    for (value in bestFit.curve) {
                        if (bestFit.curve[value].selected === true) {
                            bestFitData = graphingToolModel._getBestFitCurve(points, value, isUpdate, chartProp);
                            if (bestFitData) {
                                this._addBestFitToChart(chartView, bestFitData, points, cid, color, true, "curve", value);
                                bestFit = tableView.setBestFitCurves("curve", value, bestFit, points);
                                equationPanel.trigger("set-best-fit-option-selected", tableView, cid, "curve", value);
                            }
                        }
                    }
                }
                if (bestFit.exp && bestFit.exp.selected === true) {
                    bestFitData = graphingToolModel._getBestFitExp(points, isUpdate, chartProp, isUpdate);
                    if (bestFitData) {
                        this._addBestFitToChart(chartView, bestFitData, points, cid, color, true, 'exp');
                        bestFit = tableView.setBestFitOthers('exp', bestFit, points);
                        equationPanel.trigger('set-best-fit-option-selected', tableView, cid, 'exp');
                    }
                }
                if (bestFit.polynomial && bestFit.polynomial.selected === true) {
                    bestFitData = graphingToolModel._getBestFitPolynomial({
                        "points": points,
                        "isIntermediateCall": isUpdate,
                        "parentEquation": equationData,
                        "chartProp": chartProp
                    });
                    if (bestFitData) {
                        this._addBestFitToChart(chartView, bestFitData, points, cid, color, true, 'polynomial');
                        bestFit = tableView.setBestFitOthers('polynomial', bestFit, points);
                        equationPanel.trigger('set-best-fit-option-selected', tableView, cid, 'polynomial');
                    }
                }
            }

            return bestFit;
        },
        "_createChart": function(chartName, tableContents, $container, tableView, columnNo) {
            var combooptions,
                $comboBox,
                highChartOptions,
                index,
                isValidData,
                BASEPATH = MathUtilities.Tools.Graphing.Models.GraphingToolModel.BASEPATH,
                tableName = tableView.tableCounter,
                $dropDown,
                DROP_DOWN_HEIGHT_PADDING = 2,
                comboId,
                columnCid = tableView._getColumnCid(columnNo),
                COMBO_BOX_HT = 34,
                $topChartElem,
                accManagerView = this.accManagerView,
                chartView = new MathUtilities.Components.GraphChart.Views.ChartWindow({
                    "chartName": chartName,
                    "container": $container,
                    "dropDownId": comboId,
                    "accManagerView": this.accManagerView,
                    "startIndex": this.chartNumber = (this.chartNumber ? this.chartNumber + 20 : 200),
                    "equationPanelView": this.graphingToolView._equationPanel
                });
            comboId = "table-drop-down-" + chartView.cid;
            chartView.off('chart-close-btn-clicked').on('chart-close-btn-clicked', _.bind(function(currentTarget) {
                    var tableViewObj = this._getTableVIewUsingChart(chartView),
                        charDataObj, visibleCounter = 0,
                        totalChartCounter = 0,
                        isChartVisible = true;
                    if (tableViewObj) {
                        charDataObj = this.tableChartMappingObj[tableViewObj.cid][chartName].view;
                        _.each(charDataObj, function(value) {
                            if (value.visible === true) {
                                visibleCounter++;
                            }
                            totalChartCounter++;
                        });
                        if (visibleCounter === 1) {
                            isChartVisible = false;
                        }
                        tableViewObj.trigger('chart-close-btn-clicked', chartName, isChartVisible, currentTarget);
                        $topChartElem = this.windowManagerView.elementsArray[this.windowManagerView.elementsArray.length - 1];
                        if ($topChartElem) {
                            this.accManagerView.setFocus($topChartElem.attr('id'));
                        } else {
                            this.accManagerView.setFocus('grid-graph-canvas-acc-container');
                        }
                    }
                }, this))
                .off("show-chart-options")
                .on("show-chart-options", _.bind(function() {
                    this._populateDropDown(chartView, tableView, chartName);
                }, this))
                .off("chart-points-calculated")
                .on("chart-points-calculated", _.bind(function(obj, colNo) {
                    this._addExtraColumnsToTable(obj, tableView, chartName, colNo);
                }, this))
                .off("data-table-changed")
                .on("data-table-changed", _.bind(function(dataTableName, tableChartName) {
                    this.showTableChangeAlert(dataTableName, tableChartName, tableView);
                }, this))
                .off("box-calculation-error").on("box-calculation-error", _.bind(function() {
                    isValidData = this.isTablePointsMoreThanFive(chartView);
                    this._removeErrorChart(chartView, tableView, chartName);
                    this.removedErrorChart = true;
                    if (isValidData) {
                        tableView.trigger('no-valid-data-for-box');
                    } else {
                        tableView.trigger('box-calculation-error');
                    }
                    return void 0;
                }, this))
                .on("histogram-calculation-error", _.bind(function() {
                    this._removeErrorChart(chartView, tableView, chartName);
                    this.removedErrorChart = true;
                    tableView.trigger("histogram-calculation-error");
                    return void 0;
                }, this))
                .off("add-or-draw-best-fit").on("add-or-draw-best-fit", _.bind(this._updateOrAddBestFitToChart, this, tableView, chartView))
                .off('hide-chart').on('hide-chart', _.bind(this._hideChartView, this))
                .off("chart-dragged").on("chart-dragged", _.bind(function() {
                    this.windowManagerView.chartPositionUpdated();
                }, this));
            this.removedErrorChart = false;
            this.setMarkerObjForChart(chartName, tableContents);
            chartView.createChartWindow({
                "chartName": chartName,
                "tableContents": tableContents,
                "tableNameArray": this.tableNameArray,
                "highChartOptions": highChartOptions,
                "bestFitObjects": this.bestFitObjects[tableView.cid],
                "columnCid": columnCid,
                "columnNo": columnNo,
                "tableView": tableView
            });
            index = this.tableNameArray.indexOf(tableName);

            //create custom combo box
            combooptions = {
                "el": chartView.$el,
                "containerHt": this.$chartContainer.height(),
                "elementData": [{
                    "elementID": comboId,
                    "selectedItem": index,
                    "imagePath": BASEPATH + "/img/tools/common/components/graph-chart/chart_drop_down_arrow.png"
                }],
                "singleElemHeight": COMBO_BOX_HT,
                "comboCollection": this.comboCollection

            };
            this.customComboController = MathUtilities.Components.ComboboxController.generateCustomComboboxController(combooptions);
            this.customComboController.on('open-drop-down-above', _.bind(function($dropDownAbove) {
                this._openDropDownAbove($dropDownAbove);
            }, this));
            // This call makes to controller to parse entire dom in context to passed element above, and make it as CustomCombo.

            $comboBox = chartView.$("#" + comboId);
            $comboBox.on("click", _.bind(function() {
                    $dropDown = chartView.$(".customComboDropDown");
                    $dropDown.css({
                        "height": this.DROP_DOWN_LINE_HEIGHT * $dropDown.children().length + DROP_DOWN_HEIGHT_PADDING,
                        "max-height": this.DROP_DOWN_MAX_HEIGHT
                    });
                }, this))
                .off("change").on("change", function() {
                    chartView.setChartTable($comboBox.val());
                    accManagerView.changeAccMessage(comboId + '-combo-holder', 0, [accManagerView.getMessage('table-number-text', 0, [$comboBox.val()])]);
                    chartView.trigger("data-table-changed", $comboBox.val(), chartName);
                });

            if (!this.removedErrorChart) {
                this.windowManagerView.newElementAdded(chartView.$el);
            }
            chartView.setChartPosition(chartView.$el.position().top, chartView.$el.position().left, true);

            chartView.on('show-hide-data-series', _.bind(this.graphingToolView._setActiveElementFocus, this));
            this.accManagerView.loadScreen('chart-options-screen-' + chartView.cid);
            return chartView;
        },

        "isTablePointsMoreThanFive": function(chartView) {
            var graphChart = MathUtilities.Components.GraphChart.Models.Chart,
                actualTableData = chartView.model.get('tableContents').actualTableData,
                loopVar, dataLength,
                data = graphChart.removeBlankCells(actualTableData);
            dataLength = data.length;
            for (loopVar = 0; loopVar < dataLength; loopVar++) {
                if (data[loopVar].length > 4) {
                    return true;
                }
            }
            return false;
        },

        "disableAnimation": function() {
            Highcharts.setOptions({
                "chart": {
                    "animation": false
                },
                "plotOptions": {

                    "series": {
                        "animation": false
                    }
                }
            });
        },
        "enableAnimation": function() {
            Highcharts.setOptions({
                "chart": {
                    "animation": true
                },
                "plotOptions": {
                    "series": {
                        "animation": true
                    }
                }
            });
        },
        "_removeErrorChart": function(chartObj, tableView, chartName) {
            var chartView = chartObj,
                $chartViewEl = chartView.$el,
                dataColumnCid = $chartViewEl.attr('data-column-cid'),
                tableViewCid = tableView.cid;
            if ($chartViewEl) {
                this.windowManagerView.deleteElement($chartViewEl);
                $chartViewEl.hide();
            }
            tableView.deselectChartButton(chartName);
            delete this.tableChartMappingObj[tableViewCid][chartName];
            this.totalChartNumber--;
            this.tableChartMappingObj[tableViewCid][chartName] = {
                "visible": false,
                "isSelected": false,
                "view": {}
            };
            this.tableChartMappingObj[tableViewCid][chartName].view[dataColumnCid] = chartView;
        },
        "_createCustomComboboxes": function($chart) {

            this.customComboController = new MathUtilities.Components.CustomCombo();
            this.customComboController.setContextElement($chart, this.$chartContainer.height());
            // This call makes to controller to parse entire dom in context to passed element above, and make it as CustomCombo.
            /*eslint-disable new-cap*/
            this.customComboController.ParseDOM();
            /*eslint-enable new-cap*/
        },
        "chartTableDropDownHover": function(event) {
            var $target = $(event.currentTarget);
            $target.addClass("hovered");
        },
        "chartTableDropDownLeave": function(event) {
            var $target = $(event.currentTarget);
            $target.removeClass("hovered down");
        },
        "chartTableDropDownDown": function(event) {
            var $target = $(event.currentTarget);
            $target.addClass("down");
        },
        "chartTableDropDownUp": function(event) {
            var $target = $(event.currentTarget);
            $target.removeClass("down");
        },
        "_openDropDownAbove": function($dropDown) {
            var noOfChildren = $dropDown.children().length,
                newTop,
                TOP_TOLERANCE = 2,
                dropParent = $dropDown.parent().find(".customCombo");
            $dropDown.css({
                "height": this.DROP_DOWN_LINE_HEIGHT * noOfChildren + TOP_TOLERANCE,
                "max-height": this.DROP_DOWN_MAX_HEIGHT
            });
            newTop = $dropDown.position().top - ($(dropParent).height() + $dropDown.height() + TOP_TOLERANCE);
            $dropDown.css({
                "top": newTop
            });
            $dropDown.addClass("drop-down-above");
        },
        "_addExtraColumnsToTable": function(obj, tableView, chartName, columnNo) {
            var tableModel = tableView.model,
                dotChartData, histogramData;
            switch (chartName) {
                case "dot":
                    dotChartData = tableModel.get('dotChartData');
                    dotChartData[columnNo] = obj;
                    tableModel.set('dotChartData', dotChartData);
                    break;
                case "box":
                    tableModel.set("boxAndWhiskerData", obj);
                    break;
                case "histogram":
                    histogramData = tableModel.get('histogramData');
                    histogramData[columnNo] = obj;
                    tableModel.set('histogramData', histogramData);
                    break;
            }

        },
        "addTableRow": function(tableView, rowContent, rowNo, chartName) {
            tableView.insertRowAfter(rowNo, true);
            tableView.setRowContent(rowNo + 1, rowContent, false);
            tableView.disableAllCellsInRow(rowNo + 1);
            $(tableView.getRow(rowNo + 1)).attr("data-ignore-cell", true).parent(".row").attr("data-ignore-row", true);
            tableView.$(".hasCursor").find("textarea").blur();
        },
        "addTableColumn": function(tableView, columnNo, colContent, headerContent, chartName) {
            var $header;
            tableView.newCol(false, columnNo, false);
            tableView.setColumnContent(columnNo, colContent, false);
            $header = $(tableView.getCellAt(1, columnNo));
            tableView.disableCell($header);
            $header.attr({
                "data-ignore-column": true,
                "data-chart-name": chartName
            });
            tableView.setCellContent($header, headerContent, false);
            tableView.disableAllCellsInColumn(columnNo);
        },
        "_hideBestFit": function(tableView, type, subType, cid) {

            var tableViewCid = tableView.cid,
                tableModel = tableView.model,
                chartName,
                actualColumnCid,
                bestFitCounter = tableModel.get("boxBestFitCounters"),
                chartBestFit = tableModel.get("chartBestFit"),
                chartDataObj = this.tableChartMappingObj[tableViewCid],
                ignoreCharts = ["pie"],
                chart;
            if (!chartBestFit.bestFit) {
                return void 0;
            }
            chartBestFit.bestFit[cid] = tableView._hideBestFit(type, subType, chartBestFit.bestFit[cid]);
            if (!subType) {
                subType = "";
            }
            for (chart in chartDataObj) {
                if (ignoreCharts.indexOf(chart) !== -1) {
                    continue;
                }
                if (["bar", "column"].indexOf(chart) > -1) {
                    chartName = 'bar';
                    actualColumnCid = tableView._getColumnCid(1);
                } else {
                    chartName = chart;
                    actualColumnCid = cid;
                }
                if (chart === "box" && (bestFitCounter[type] > 1 || bestFitCounter[subType] > 1)) {
                    continue;
                }
                if (chartDataObj[chart].isSelected && (chartBestFit.bestFit[cid] || chartBestFit[chartName][cid])) {
                    if (ignoreCharts.indexOf(chart) === -1) {
                        if (chart !== "box") {
                            if (chartBestFit[chartName]) {
                                chartBestFit[chartName][cid] = tableView._hideBestFit(type, subType, chartBestFit[chartName][cid]);
                                chartDataObj[chart].view[actualColumnCid].hideSeries(type + subType + '-' + cid);
                            }
                        }
                    }
                }
            }
            tableModel.set("chartBestFit", chartBestFit);
            if (subType) {
                bestFitCounter[subType]--;
            } else {
                bestFitCounter[type]--;
            }
            tableModel.set("boxBestFitCounters", bestFitCounter);
        },
        "_plotColumnHidden": function(tableView, cid, isUndoRedoAction) {
            var chartDataObj = this.tableChartMappingObj[tableView.cid],
                charDataView,
                currView = null;

            if (chartDataObj) {
                _.each(chartDataObj, _.bind(function(value, index) {
                    charDataView = value;
                    if (charDataView.isSelected === true) {
                        if (['column', 'bar', 'box'].indexOf(index) > -1) {
                            currView = charDataView.view[tableView._getColumnCid(1)];
                            if (currView && currView.visible === true) {
                                this._updateAndShowChart(charDataView, tableView, index);
                            }
                        } else {
                            currView = charDataView.view[cid];
                            if (currView && currView.visible === true) {
                                this._hideChartView(currView);
                                currView.visible = true;
                            }
                        }
                    }
                    charDataView.visible = false;
                }, this));
            }
        },

        "_plotColumnShown": function(tableView, cid, isUndoRedoAction, showBestFit) {
            var chartDataObj = this.tableChartMappingObj[tableView.cid],
                charDataView,
                currView = null;

            if (chartDataObj) {
                _.each(chartDataObj, _.bind(function(value, index) {
                    charDataView = value;
                    if (charDataView.isSelected === true) {
                        if (['column', 'bar', 'box'].indexOf(index) > -1) {
                            currView = charDataView.view[tableView._getColumnCid(1)];
                            if (currView && currView.visible === true) {
                                this._updateAndShowChart(charDataView, tableView, index);
                            }
                        } else {
                            currView = charDataView.view[cid];
                            if (currView && currView.visible === true) {
                                this._showChartView(currView, '', '', tableView);
                                currView.setChartPosition(currView.$el.position().top, currView.$el.position().left, true);
                                if (showBestFit) {
                                    currView.trigger('add-or-draw-best-fit', index);
                                }
                                currView._applyHighChartSettings(true);
                                currView._updateChartLegendSize();
                            }
                        }

                    }
                    charDataView.visible = true;
                }, this));
            }
        },
        "_updateHiddenSeries": function(tableView, isRowHeaderChecked) {
            var chartDataObj = this.tableChartMappingObj[tableView.cid],
                index, adjustValue,
                hiddenSeries, hiddenSeriesLength, removeIndex;
            if (isRowHeaderChecked) {
                adjustValue = -1;
            } else {
                adjustValue = 1;
            }
            if (chartDataObj) {
                _.each(chartDataObj, function(charDataView) {
                    _.each(charDataView.view, function(value) {
                        hiddenSeries = value.model.get('hiddenSeries').slice();
                        hiddenSeriesLength = hiddenSeries.length;
                        for (index = 0; index < hiddenSeriesLength; index++) {
                            hiddenSeries[index] = hiddenSeries[index] + adjustValue;
                        }
                        removeIndex = hiddenSeries.indexOf(-1);
                        if (removeIndex !== -1) {
                            hiddenSeries.splice(removeIndex, 1);
                        }
                        value.model.set('hiddenSeries', hiddenSeries);
                    });
                });
            }
        },
        "_tableHiddenHandler": function(tableView) {
            var chartDataObj = this.tableChartMappingObj[tableView.cid];
            if (chartDataObj) {
                _.each(chartDataObj, function(charDataView) {
                    _.each(charDataView.view, function(value) {
                        if (value.visible === true) {
                            value.$el.hide();
                        }
                    });
                    charDataView.visible = false;
                });
            }
        },
        "_tableShownHandler": function(tableView) {
            var chartDataObj = this.tableChartMappingObj[tableView.cid],
                plotColumnHidden = tableView._getOriginalColumnNoArray();
            if (chartDataObj) {
                _.each(chartDataObj, _.bind(function(charDataView) {
                    if (charDataView.isSelected === true) {
                        _.each(charDataView.view, _.bind(function(value, index) {
                            if (value.visible === true) {
                                if (plotColumnHidden.indexOf(tableView._getColumnNo(index)) === -1) {
                                    this._showChartView(value, true, '', tableView);
                                }
                                value._updateChartLegendSize();
                                value._applyHighChartSettings(true);
                                value.visible = true;
                                value._updateChartLegendSize();
                            }
                        }, this));
                        charDataView.visible = true;
                    }
                }, this));
            }
        },
        "getTableViewFromCid": function(cid) {
            var tableViews = this.tableViewsArray,
                count,
                length = tableViews.length;
            for (count = 0; count < length; count++) {
                if (tableViews[count].cid === cid) {
                    return tableViews[count];
                }
            }

        },
        "_addTableOptionToDropDown": function(tableNumber, currentTableCid) {
            var tableName = "Table " + tableNumber,
                id, selectedCharts, chartView,
                tableViews = this.tableViewsArray,
                counter, noOfCharts,
                index = this.tableNameArray.length - 1,
                count, length = tableViews.length,
                option = new Option(tableName, tableNumber),
                addItemFunction = _.bind(function(value) {
                    id = value.$('.customCombo').attr('id');
                    this.customComboController.addItem(id, index, null, option);
                }, this);
            if (this.totalChartNumber > 0) {
                for (count = 0; count < length; count++) {
                    if (tableViews[count].cid !== currentTableCid) {
                        selectedCharts = this.getSelectedChartsFromTable(tableViews[count], void 0, true);
                        noOfCharts = selectedCharts.length;
                        for (counter = 0; counter < noOfCharts; counter++) {
                            chartView = this.tableChartMappingObj[tableViews[count].cid][selectedCharts[counter].name].view;
                            _.each(chartView, addItemFunction);

                        }
                    }
                }
            }
        },
        "_removeTableOption": function(tableNumber, index) {
            if (typeof index === "undefined") {
                index = this.tableNameArray.indexOf(tableNumber);
            }
            var id = "table-drop-down-",
                chartViews = this.windowManagerView.getElementsArray(),
                count, length = chartViews.length;
            if (this.totalChartNumber > 0) {
                for (count = 0; count < length; count++) {
                    id = $(chartViews[count]).find(".customCombo").attr("id");
                    this.customComboController.removeItem(id, index, null, false);
                }
            } else {
                this.tableNumbers.push(tableNumber);
                this.tableIndex.push(index);
            }
        },
        "showTableChangeAlert": function(tableName, chartName, tableView, isUndoRedoAction) {
            var $modal = this.$el.parents('#tool-holder-4').find('#clear-list'),
                $okBtn = $modal.find('.btn-primary'),
                currentView,
                id, length = this.tableViewsArray.length,
                currentTable, counter, cid = tableView.cid,
                $cancelBtn = $modal.find('.btn-cancel'),
                graphingToolView = this.graphingToolView;
            for (counter = 0; counter < length; counter++) {
                currentTable = this.tableViewsArray[counter];
                if (cid === currentTable.cid) {
                    continue;
                }
                currentView = this.tableChartMappingObj[cid][chartName].view[tableView._getColumnCid(1)];
                if (currentTable.tableCounter === Number(tableName) && currentView) {
                    id = 'table-drop-down-' + currentView.cid;
                    break;
                }
            }
            if (currentTable.model.get('eyeOpen') === false && isUndoRedoAction !== true) {
                $cancelBtn.show();
                $modal.modal();
                $modal.find('.param-container').html('Selecting Table ' + tableName + ' will hide this chart as the Hide option for this table is active. Are you sure you would like to continue?');
                $okBtn.focus();
                $okBtn.off('click.deleteAll').on('click.deleteAll', _.bind(function() {
                    graphingToolView._closeAlertBox($modal);
                    this.dataTableChanged(tableName, chartName, tableView, isUndoRedoAction, currentTable, id);
                }, this));
                $cancelBtn.off('click.cancel').on('click.cancel', _.bind(function() {
                    graphingToolView._closeAlertBox($modal);
                    this.customComboController.setSelectedIndex(id, this._getTableIndex(tableView.tableCounter), true);
                }, this));
            } else {
                this.dataTableChanged(tableName, chartName, tableView, isUndoRedoAction, currentTable, id);
            }
        },
        "dataTableChanged": function(tableName, chartName, tableView, isUndoRedoAction, currentTable, id) {
            var tableCharts,
                newTableObj,
                oldTableObj, chartDataObj,
                cid = tableView.cid,
                newTableObjView, $list,
                chart, chartView,
                undoRedoData = {},
                chartNotPresent = false,
                undoData = {},
                redoData = {},
                currentObjCid,
                hideChartOptionFunction = function(value) {
                    value.hideChartOptions(tableView);
                },
                equationDataCid;
            $list = this.getListFromTableView(tableView);
            equationDataCid = $list.attr("data-equation-cid");
            redoData.tableName = tableName;
            redoData.chartName = chartName;
            redoData.equationCid = equationDataCid;
            if (currentTable.cid === cid) {
                return void 0;
            }
            newTableObj = this.tableChartMappingObj[currentTable.cid][chartName];
            oldTableObj = this.tableChartMappingObj[cid][chartName];
            if (oldTableObj.visible === false) {
                chartNotPresent = true;
            }
            _.each(oldTableObj.view, _.bind(function(value) {
                newTableObjView = value;
                currentObjCid = currentTable._getColumnCid(tableView._getColumnNo(newTableObjView.$el.attr('data-column-cid')));
                newTableObj.view[currentObjCid] = newTableObjView;
                if (currentTable.model.get('eyeOpen') === true) {
                    newTableObjView.visible = true;
                } else {
                    newTableObjView.visible = false;
                    newTableObjView.$el.hide();
                }
                newTableObjView.setDropDownId(id);
                newTableObjView.model.set("removeBoxData", []);
                newTableObjView.off("data-table-changed")
                    .on('data-table-changed', _.bind(function(dataTableName, tableChartName) {
                        this.showTableChangeAlert(dataTableName, tableChartName, currentTable);
                    }, this))
                    .off("show-chart-options")
                    .on("show-chart-options", _.bind(function() {
                        this._populateDropDown(newTableObjView, currentTable, chartName);
                    }, this))
                    .off("chart-points-calculated")
                    .on('chart-points-calculated', _.bind(function(obj, columnNo) {
                        this._addExtraColumnsToTable(obj, currentTable, chartName, columnNo);
                    }, this))
                    .off("box-calculation-error").on("box-calculation-error", _.bind(function() {
                        this._removeErrorChart(newTableObjView, currentTable, chartName);
                        this.removedErrorChart = true;
                        currentTable.trigger("box-calculation-error");
                        return void 0;
                    }, this))
                    .on("histogram-calculation-error", _.bind(function() {
                        this._removeErrorChart(newTableObjView, currentTable, chartName);
                        this.removedErrorChart = true;
                        currentTable.trigger("histogram-calculation-error");
                        return void 0;
                    }, this))
                    .off("add-or-draw-best-fit").on("add-or-draw-best-fit", _.bind(this._updateOrAddBestFitToChart, this, currentTable, newTableObjView))
                    .off("chart-dragged").on("chart-dragged", _.bind(function() {
                        this.windowManagerView.chartPositionUpdated();
                    }, this));
                if (chartNotPresent === true) {

                    this.windowManagerView.newElementAdded(newTableObjView.$el);
                }
                newTableObjView.$el.attr('data-column-cid', currentObjCid);

            }, this));
            newTableObj.isSelected = true;
            newTableObj.visible = true;


            this.tableChartMappingObj[cid][chartName] = {
                "view": {},
                "visible": null,
                "isSelected": null
            };
            tableView.deselectChartButton(chartName);
            currentTable.selectChartButton(chartName);
            this._updateAndShowChart(newTableObj, currentTable, chartName);
            $list = this.getListFromTableView(currentTable);
            equationDataCid = $list.attr("data-equation-cid");
            undoData.chartName = chartName;
            undoData.equationCid = equationDataCid;
            undoData.tableName = tableView.tableCounter;
            undoRedoData.undo = undoData;
            undoRedoData.redo = redoData;
            for (tableCharts in this.tableChartMappingObj) {
                for (chart in this.tableChartMappingObj[tableCharts]) {
                    chartDataObj = this.tableChartMappingObj[tableCharts][chart];
                    if (chartDataObj.isSelected === true) {
                        _.each(chartDataObj.view, hideChartOptionFunction);
                    }
                }
            }
            if (isUndoRedoAction !== true) {
                this.graphingToolView.execute("tableDropdownChanged", undoRedoData);
            } else {
                this.customComboController.setSelectedIndex(id, this._getTableIndex(Number(tableName)), true);
            }
            chartView = this.tableChartMappingObj[currentTable.cid][chartName].view;
            _.each(chartView.view, function(value) {
                if (value.cid) {
                    value.hideChartOptions(tableView);
                }
            });

        },

        "_getTableIndex": function(tableName) {
            return this.tableNameArray.indexOf(tableName);
        },
        "arrangeToFitCharts": function() {
            var counter,
                tableViewsArray = this.tableViewsArray,
                tableViewCid,
                chartDataObj,
                loopFunction,
                loopCharts,
                length = tableViewsArray.length;
            this.windowManagerView.arrangeToFitElements();
            loopCharts = function(charts) {
                _.each(charts, function(value) {
                    value.setChartPosition(value.$el.position().top, value.$el.position().left, true);
                });
            };
            loopFunction = function(value, chartName) {
                if (value.isSelected === true) {
                    loopCharts(value.view);
                }
            };
            for (counter = 0; counter < length; counter++) {
                tableViewCid = tableViewsArray[counter].cid;
                chartDataObj = this.tableChartMappingObj[tableViewCid];
                _.each(chartDataObj, loopFunction);
            }
        },
        "_populateDropDown": function(chartWindow, tableView, chartName) {
            var selectedTableName, counter, length, index, passedId,
                disableTables = [],
                currentTable, value,
                currentTableObj;
            selectedTableName = tableView.tableCounter;

            chartWindow.$(".chart-table-selector-options option[value=" + selectedTableName + "]").prop("selected", true).prop("disabled", false);
            length = this.tableViewsArray.length;
            passedId = chartWindow.$(".customCombo").attr("id");
            for (counter = 0; counter < length; counter++) {
                currentTable = this.tableViewsArray[counter];
                value = currentTable.tableCounter;
                index = this.tableViewsArray.indexOf(currentTable);
                if (currentTable.cid === tableView.cid) {
                    continue;
                }
                currentTableObj = this.tableChartMappingObj[currentTable.cid][chartName];
                if (currentTableObj.isSelected === true) {
                    disableTables.push(currentTable.tableCounter);
                    this.customComboController.enableDisableComboItem(passedId, false, index, value);
                    chartWindow.$(".chart-table-selector-options option[value=" + currentTable.tableCounter + "]").prop("disabled", true);
                } else {
                    this.customComboController.enableDisableComboItem(passedId, true, index, value);
                    chartWindow.$(".chart-table-selector-options option[value=" + currentTable.tableCounter + "]").prop("disabled", false);
                }
            }
        },
        "_updateDraggableContainment": function(isAreaIncreased) {
            var defualtContainerPosition = {
                "top": null,
                "left": null
            };

            defualtContainerPosition.top = 0;
            defualtContainerPosition.left = this.$chartContainer.offset().left;
            this.windowManagerView.setDefaultPosition(isAreaIncreased, defualtContainerPosition);
        },
        "_chartHandler": function(objParam) {
            var chartName = objParam.chartName,
                tableView = objParam.tableView,
                isUndoRedoAction = objParam.isUndoRedoAction,
                isChartVisible = objParam.isChartVisible,
                isTableUpdate = objParam.isTableUpdate,
                chartCounter = [],
                pastUndoRedoData = objParam.pastUndoRedoData,
                tableViewCid = tableView.cid,
                chartView,
                rowHeader = tableView.getRowHeaderState(),
                chartObj = this.tableChartMappingObj[tableViewCid][chartName],
                chartObjView = chartObj.view,
                equationDataCid = this.getListFromTableView(tableView).attr('data-equation-cid'),
                chartViewCid,
                tableViewColumnCid,
                loopVar,
                tableData = tableView.getTableDataForCharts(),
                rowHeaderValue,
                $target = objParam.currentTarget,
                closeClickedColumnNo = null,
                chartObjViewLength = Object.keys(chartObjView).length,
                tableDataLength = tableView.getColCount(),
                plotColumnHidden,
                chartCheck = ['pie', 'histogram', 'dot'].indexOf(chartName) > -1,
                undoRedoData = {},
                undoData = {
                    "chartName": chartName,
                    "equationCid": equationDataCid,
                    "chartOptions": []
                },
                redoData = {
                    "chartName": chartName,
                    "equationCid": equationDataCid
                },
                isRowHeaderChange = tableView.model.get('isRowHeaderChange');
            rowHeaderValue = loopVar = rowHeader ? 2 : 1;
            if (!chartCheck) {
                tableData = tableView.getTableDataForCharts(true);
                tableDataLength = 1;
                loopVar = 1;
                rowHeaderValue = 1;
            }
            plotColumnHidden = tableView._getOriginalColumnNoArray();
            if (chartObjViewLength === 0 || this._compareColumnCid(chartObjView, tableView, true) && chartCheck === true) {
                if (!chartObj.isSelected) {
                    isRowHeaderChange = false;
                }
                for (loopVar; loopVar <= tableDataLength; loopVar++) {
                    if (tableView.isNextColumnResidual(loopVar, true) || 
                        typeof tableData.points[Number(tableView._getOriginalColumnNo(loopVar)) - rowHeaderValue] === 'undefined' && chartCheck) {
                        continue;
                    }
                    tableViewColumnCid = tableView._getColumnCid(loopVar);
                    chartViewCid = this._getChartView(chartObj, tableViewColumnCid);
                    if (chartViewCid) {
                        chartView = chartObjView[tableViewColumnCid];
                        if (chartObj.isSelected === false || chartView.visible && tableView.getTableVisiblity()) {
                            this._showChartView(chartView, false, plotColumnHidden, tableView);
                            chartView.visible = true;
                        } else {
                            chartView.$el.hide();
                            chartView.visible = !tableView.getTableVisiblity();
                        }
                    } else {
                        chartView = this._addChartView(chartName, tableData, tableView, loopVar);
                        chartObj.view[tableViewColumnCid] = chartView;
                    }
                }
                tableDataLength = tableData.points.length;
                if (chartCheck === true) {
                    _.each(this._compareColumnCid(chartObjView, tableView, false), _.bind(function(currentViewKey) {
                        _.each(chartObjView, _.bind(function(value, index) {
                            if (value.$el.attr('data-column-cid') === currentViewKey) {
                                value.unbind();
                                value.$el.remove();
                                delete chartObjView[index];
                                this.totalChartNumber--;
                                this.windowManagerView.deleteElement(value.$el);
                            }
                        }, this));
                    }, this));
                }
                this._updateAndShowChart(chartObj, tableView, chartName, !chartObj.isSelected);
                chartObj.isSelected = true;
                undoData.actionType = 'hideChart';
                redoData.actionType = 'showChart';
            } else {
                if (isUndoRedoAction === true && pastUndoRedoData.isChartClicked === false) {
                    chartView = chartObjView[pastUndoRedoData.columnNo];
                    if (pastUndoRedoData.state === 'open') {
                        this._showChartView(chartView, isUndoRedoAction, plotColumnHidden, tableView);
                        chartObj.visible = true;
                        chartObj.isSelected = true;
                        tableView.selectChartButton(pastUndoRedoData.chartName);
                    } else {
                        chartView = this._hideChartView(chartView, undoData);
                        isChartVisible = pastUndoRedoData.isChartVisible;
                        if (pastUndoRedoData.isChartVisible === true) {
                            tableView.selectChartButton(pastUndoRedoData.chartName);
                        } else {
                            tableView.deselectChartButton(pastUndoRedoData.chartName);
                        }
                        chartObj.visible = isChartVisible;
                        chartObj.isSelected = isChartVisible;
                    }
                } else if (isUndoRedoAction === true && pastUndoRedoData.isAllChartVisible === false) {
                    for (loopVar = 0; loopVar < pastUndoRedoData.chartNumber.length; loopVar++) {
                        this._showChartView(chartObjView[pastUndoRedoData.chartNumber[loopVar]], true, plotColumnHidden, tableView);
                        chartObj.visible = true;
                        chartObj.isSelected = true;
                        tableView.selectChartButton(pastUndoRedoData.chartName);
                    }
                } else if (chartObj.isSelected === true) {
                    if ($target && $target.is('.chart-close-button')) {
                        closeClickedColumnNo = $target.parents('.chart-window').attr('data-column-cid');
                        chartObjView = chartObjView[closeClickedColumnNo];
                        chartView = this._hideChartView(chartObjView, undoData);
                        if (isChartVisible === false) {
                            chartObj.visible = false;
                            chartObj.isSelected = false;
                        }
                        undoData.isChartClicked = false;
                        redoData.isChartClicked = false;
                        redoData.chartOptions = undoData.chartOptions;
                        undoData.isChartVisible = !isChartVisible;
                        redoData.isChartVisible = isChartVisible;
                        undoData.state = 'open';
                        redoData.state = 'hide';
                        undoData.columnNo = closeClickedColumnNo;
                        redoData.columnNo = closeClickedColumnNo;
                        undoData.isAllChartVisible = false;
                        redoData.isAllChartVisible = true;
                    } else {
                        _.each(chartObj.view, _.bind(function(value, index) {
                            if (value.visible === true) {
                                chartView = this._hideChartView(value, undoData);
                                chartCounter.push(index);
                            }
                        }, this));
                        if (chartCounter.length === chartObjViewLength) {
                            undoData.isAllChartVisible = true;
                            redoData.isAllChartVisible = true;
                        } else {
                            undoData.chartNumber = chartCounter;
                            redoData.chartNumber = chartCounter;
                            undoData.isAllChartVisible = false;
                            redoData.isAllChartVisible = true;
                        }
                        chartObj.visible = false;
                        chartObj.isSelected = false;
                        undoData.isChartClicked = true;
                        redoData.isChartClicked = true;
                    }
                    if (isRowHeaderChange === true && !chartCheck) {
                        isRowHeaderChange = false;
                    }
                    this.removeAddedColumns(chartName, tableView);
                    redoData.actionType = "hideChart";
                    undoData.actionType = "showChart";
                } else {
                    this._sortChartView(chartObj.view, function(value) {
                        this._showChartView(value, isUndoRedoAction, plotColumnHidden, tableView);
                    }, this);
                    this._updateAndShowChart(chartObj, tableView, chartName, !isUndoRedoAction);
                    chartObj.isSelected = true;
                    if (this.tableIndex.length > 0) {
                        this._removeTableOptions();
                    }
                    undoData.actionType = "hideChart";
                    redoData.actionType = "showChart";
                }
            }
            this.hideAllChartOptions(tableView);
            if (isTableUpdate !== true) {
                this.graphingToolView._equationPanel._updateListWidth();
                this.graphingToolView.closeKeyboard();
            }
            undoRedoData.undo = undoData;
            undoRedoData.redo = redoData;
            if (isUndoRedoAction !== true && isRowHeaderChange === false && this.removedErrorChart === false) {
                this.graphingToolView.execute('showHideChart', undoRedoData);
            }
            return chartObj;
        },
        "_compareColumnCid": function(chartObjView, tableView, check) {
            var tableViewColumnCid = [],
                tableData = tableView.getTableDataForCharts(),
                chartObjViewColumnCid = [],
                tableDataLength = tableView.getColCount(),
                chartViewDataLength = Object.keys(chartObjView).length,
                difference = null,
                rowHeaderValue,
                loopVar = rowHeaderValue = tableView.getRowHeaderState() ? 2 : 1;
            for (; loopVar <= tableDataLength; loopVar++) {
                if (tableView.isNextColumnResidual(loopVar, true) === false && 
                    tableData.points[Number(tableView._getOriginalColumnNo(loopVar)) - rowHeaderValue]) {
                    tableViewColumnCid.push(tableView._getColumnCid(loopVar));
                }
            }
            _.each(chartObjView, function(value) {
                chartObjViewColumnCid.push(value.$el.attr('data-column-cid'));
            });
            difference = tableData.points.length > chartViewDataLength ? _.difference(tableViewColumnCid, chartObjViewColumnCid) : _.difference(chartObjViewColumnCid, tableViewColumnCid);
            return check === true ? difference.length > 0 : difference;
        },
        "_mapChartViewKeyWise": function(chartObjView, actualColumnNo, chartColumnNo, tableView) {
            var tableColumnNo;
            if (chartObjView[actualColumnNo]) {
                tableColumnNo = tableView._getColumnNo(chartObjView[actualColumnNo].$el.attr('data-column-cid'));
            }
            if (typeof tableColumnNo === 'undefined') {
                if (chartObjView[actualColumnNo]) {
                    chartObjView[actualColumnNo].unbind();
                    chartObjView[actualColumnNo].$el.remove();
                }
                chartObjView[actualColumnNo] = chartObjView[chartColumnNo];
                delete chartObjView[chartColumnNo];
            }
            return chartObjView;
        },
        "_sortChartView": function(obj, iterator, context) {
            var keys = Object.keys(obj),
                loopVar = 0,
                sortedKeys = keys.sort();
            for (loopVar = 0; loopVar < keys.length; loopVar++) {
                iterator.call(context, obj[sortedKeys[loopVar]], loopVar, obj);
            }
        },
        "_hideChartView": function(chartView, undoData) {
            var chartViewModel = chartView.model,
                chartOptions;
            chartView.trigger('hide-tooltip');
            chartView.$el.hide();
            chartView.visible = false;
            this.totalChartNumber--;
            chartOptions = chartViewModel.get('chartOptionsData');
            chartOptions.numberOfBins = chartViewModel.get('bins');
            chartOptions.hiddenSeries = chartViewModel.get('hiddenSeries');
            if (undoData) {
                undoData.chartOptions.push(chartOptions);
            }
            if (this.windowManagerView.findAddedElement(chartView.$el).length !== 0) {
                this.windowManagerView.deleteElement(chartView.$el);
            }
            return chartView;
        },
        "_showChartView": function(chartView, isUndoRedoAction, plotColumnHidden, tableView) {
            var chartData = chartView.getChartData(),
                $el = chartView.$el,
                dataColumnCid = $el.attr('data-column-cid'),
                columNo = tableView._getOriginalColumnNo(Number(tableView._getColumnNo(dataColumnCid)));
            if (plotColumnHidden === void 0 || plotColumnHidden.indexOf(columNo) === -1) {
                $el.show();
                if (this.windowManagerView.findAddedElement($el).length === 0) {
                    this.windowManagerView.newElementAdded($el);
                    this.totalChartNumber++;
                    chartView.setChartPosition($el.position().top, $el.position().left, true);
                }
            }
            chartView.visible = true;
            if (isUndoRedoAction === true) {
                chartView.setChartPosition(chartData.chartPosition.top, chartData.chartPosition.left);
                chartView.setChartSize(chartData.chartSize);
                $el.css({
                    "z-index": chartData.zIndex
                });
            }
        },
        "_addChartView": function(chartName, tableData, tableView, columnNo) {
            var chartView,
                $container = this.$chartContainer,
                graphingView = this.graphingToolView,
                plotColumnHidden = tableView._getOriginalColumnNoArray();

            this.removeAddedColumns(chartName, tableView);
            this.totalChartNumber++;
            chartView = this._createChart(chartName, tableData, $container, tableView, columnNo);

            if (!chartView) {
                return void 0;
            }
            chartView.on('show-tooltip', function(tooltipProperties) {
                graphingView.trigger('show-tooltip', tooltipProperties);
            });
            chartView.on('hide-tooltip', function() {
                graphingView.trigger('hide-tooltip');
            });
            chartView.setChartPosition(chartView.$el.position().top, chartView.$el.position().left, true);
            if (plotColumnHidden.indexOf(tableView._getOriginalColumnNo(columnNo)) > -1) {
                this._hideChartView(chartView);
            }
            chartView.visible = true;
            return chartView;
        },
        "_getChartView": function(chartObj, columnCid) {
            var columnNo = false;
            if (typeof columnCid === 'undefined') {
                return columnCid;
            }
            _.each(chartObj.view, function(value, index) {
                if (columnCid === value.$el.attr('data-column-cid')) {
                    columnNo = true;
                }
            });
            return columnNo;
        },
        "_removeTableOptions": function() {
            var loopVar, indexLength;
            indexLength = this.tableIndex.length;
            for (loopVar = 0; loopVar < indexLength; loopVar++) {
                this._removeTableOption(this.tableNumbers[loopVar], this.tableIndex[loopVar]);
            }
            this.tableNumbers = [];
            this.tableIndex = [];
        },
        "hideAllTableChartOptions": function() {
            var tableCounter,
                noOfTables = this.tableViewsArray.length;
            for (tableCounter = 0; tableCounter < noOfTables; tableCounter++) {
                this.hideAllChartOptions(this.tableViewsArray[tableCounter]);
            }
        },
        "hideAllChartOptions": function(tableView) {
            var tableCharts,
                chart,
                chartDataObj,
                tableChartMappingObj = this.tableChartMappingObj,
                hideChartFunction = function(value) {
                    if (value.$('.chart-options-container').is('.visible')) {
                        value.hideChartOptions(tableView);
                    }
                };

            for (tableCharts in tableChartMappingObj) {
                for (chart in tableChartMappingObj[tableCharts]) {
                    chartDataObj = tableChartMappingObj[tableCharts][chart];
                    if (chartDataObj.isSelected === true) {
                        _.each(chartDataObj.view, hideChartFunction);
                    }
                }
            }
        },

        "showHideChart": function(chartName, tableView, undoRedoData) {
            var objParam = {
                    "chartName": chartName,
                    "tableView": tableView,
                    "isUndoRedoAction": true,
                    "pastUndoRedoData": undoRedoData
                },
                columnNo = null,
                counter = 0,
                chartObj = this._chartHandler(objParam),
                $currLegend,
                noOfLegends,
                currIndex;

            if (chartObj.isSelected === true) {
                if (undoRedoData && undoRedoData.columnNo) {
                    columnNo = undoRedoData.columnNo;
                    chartObj.view[columnNo].setChartData({
                        "chartOptionsData": undoRedoData.chartOptions[0]
                    }, tableView);
                    this.windowManagerView.isChartPositionUpdated = false;
                    if (chartObj.view[columnNo].chartName === 'pie') {
                        noOfLegends = chartObj.view[columnNo].$('.chart-legend').length;
                        for (currIndex = 0; currIndex < noOfLegends; currIndex++) {
                            $currLegend = $(chartObj.view[columnNo].$('.chart-legend')[currIndex]);
                            if ($currLegend.hasClass('deselected')) {
                                $currLegend.trigger('click');
                            }
                        }
                    }
                } else {
                    _.each(chartObj.view, function(value, index) {
                        if (undoRedoData.chartOptions) {
                            if (!(undoRedoData.chartOptions instanceof Array)) {
                                value.setChartData({
                                    "chartOptionsData": undoRedoData.chartOptions
                                }, tableView);
                            } else {
                                value.setChartData({
                                    "chartOptionsData": undoRedoData.chartOptions[counter]
                                }, tableView);
                                counter++;
                            }

                        }
                    });
                }
            }
            return chartObj.visible;
        },
        "getListFromTableView": function(tableView) {
            var $list = tableView.$el.parents(".list");
            return $list;
        },
        "removeAddedColumns": function(chartName, tableView) {
            var counter, length, colNo, rowNo, cols, dataCol, cell, columnColors = tableView.model.get("columnColors"),
                MAX_COLUMNS = 5;
            if (chartName !== "box") {
                cols = tableView.$(".cell[data-chart-name=" + chartName + "]");
                length = cols.length;
                for (counter = 0; counter < length; counter++) {
                    dataCol = cols.eq(counter).attr("data-column");
                    colNo = dataCol.split("col")[1];
                    tableView.deleteCol(colNo);
                    columnColors.splice(colNo - 1, 1);
                }
            } else {
                //remove last 5 rows
                for (counter = 0; counter < MAX_COLUMNS; counter++) {
                    rowNo = tableView.getRowCount();
                    cell = tableView.getCellAt(rowNo, 1);
                    if ($(cell).attr("data-ignore-cell") === "true") {
                        tableView.deleteRow(rowNo);
                    }
                }
            }
            tableView.model.set("columnColors", columnColors);
        },
        "_updateAllChartsForTable": function(tableView, colNumber, isUndoRedoAction) {
            var tableViewCid = tableView.cid,
                chartDataObj = this.tableChartMappingObj[tableViewCid],
                tableModel = tableView.model,
                isRowHeaderChange = tableModel.get('isRowHeaderChange'),
                isUpdate = false,
                tableData = tableView.getTableDataForCharts(),
                objParam = {
                    "tableView": tableView,
                    "isUndoRedoAction": true,
                    "columnNo": colNumber,
                    "isTableUpdate": true
                };
            _.each(chartDataObj, _.bind(function(chartDataObjValue, chartName) {
                if (chartDataObjValue.isSelected === true) {
                    if (tableData.points.length !== Object.keys(chartDataObjValue.view).length && 
                        ['pie', 'histogram', 'dot'].indexOf(chartName) > -1) {
                        objParam.chartName = chartName;
                        this._chartHandler(objParam);
                        isUpdate = true;
                    } else {
                        this._updateAndShowChart(chartDataObjValue, tableView, chartName);
                    }
                }
            }, this));
            if (isUpdate && isRowHeaderChange) {
                tableModel.set('isRowHeaderChange', false);
            }
        },
        "_updateAndShowChart": function(chartObj, tableView, chartName, isShowChart) {
            //update and show chart
            var tableData = tableView.getTableDataForCharts(),
                hasError,
                $chart = null,
                skipColumnArr = tableView._getOriginalColumnNoArray(),
                loopVar = null,
                plotColumnHidden,
                filteredTableData = null,
                tableViewVisibility = null,
                isColumnBarOrBox = ['column', 'bar', 'box'].indexOf(chartName) > -1,
                modifiedTableData = tableData;
            filteredTableData = tableView.getTableDataForCharts(true);
            plotColumnHidden = skipColumnArr.slice();
            this.removeAddedColumns(chartName, tableView);
            tableViewVisibility = tableView.getTableVisiblity();
            _.each(chartObj.view, _.bind(function(value, index) {
                loopVar = Number(tableView._getColumnNo(index));
                $chart = value.$('.charts');
                if (tableViewVisibility === true && value.visible === true && 
                    plotColumnHidden.indexOf(tableView._getOriginalColumnNo(loopVar)) === -1) {
                    value.$el.show();
                    value.visible = true;
                } else {
                    value.$el.hide();
                }
                chartObj.visible = true;
                value.$('.chart-legend.deselected').removeClass('deselected');
                value.on('histogram-calculation-error', _.bind(function() {
                    hasError = true;
                }));
                if (isColumnBarOrBox) {
                    tableData = filteredTableData;
                    modifiedTableData = tableData;
                    value.model.set('skipColumn', skipColumnArr);
                }
                this.setMarkerObjForChart(chartName, tableData);
                if (isShowChart === true) {
                    value._updateDefaultChartOptions();
                    value._setAndDrawChart({
                        "tableContents": modifiedTableData,
                        "chartName": chartName,
                        "$chart": $($chart[0]),
                        "chartOptions": '',
                        "columnNo": loopVar,
                        "tableView": tableView
                    });
                    value.setDefaultChecked(value.$('.chart-options-container'), tableView);
                } else {
                    value.model.set('columnNo', loopVar);
                    value.updateChartData({
                        "tableContents": modifiedTableData,
                        "chartOptions": '',
                        "histogramData": '',
                        "isUpdate": true,
                        "tableView": tableView
                    });
                }
                if (hasError === true) {
                    return void 0;
                }
            }, this));
            chartObj.isSelected = true;
            this.setMarkerObjForChart(chartName, modifiedTableData);
        },
        "setMarkerObjForChart": function(chartName, tableData) {
            var BASEPATH = MathUtilities.Tools.Graphing.Models.GraphingToolModel.BASEPATH;
            if (chartName === "dot") {
                tableData.markerObj = {
                    "symbol": 'url(' + BASEPATH + 'img/tools/common/tools/graphing-plotting/dot_plot_cross.png)',
                    "lineColor": '#000',
                    "lineWidth": 2
                };
            } else if (chartName === 'box') {
                tableData.markerObj = {
                    "fillColor": '#ffc000'
                };
            }
        },
        "_deleteTableChart": function(tableView) {
            var tableViewCid = tableView.cid,
                tableNumber = tableView.tableCounter,
                chartDataObj = this.tableChartMappingObj[tableViewCid],
                index,
                tableName,
                tableViews = this.tableViewsArray,
                count, length = tableViews.length;

            for (count = 0; count < length; count++) {
                tableName = Number(tableViews[count].tableCounter);
                if (tableName === tableNumber) {
                    index = count;

                }
            }
            _.each(chartDataObj, _.bind(function(chartDataView, chartName) {
                if (chartDataView.isSelected) {
                    _.each(chartDataView.view, _.bind(function(value) {
                        this.windowManagerView.deleteElement(value.$el);
                        value.$el.remove();
                        this.totalChartNumber--;
                    }, this));
                    chartDataView.visible = null;
                    chartDataView.isSelected = null;
                }
            }, this));
            delete this.tableChartMappingObj[tableViewCid];
            index = this.tableViewsArray.indexOf(tableView);
            this.tableViewsArray.splice(index, 1);
            this._removeTableOption(tableNumber, index);
            index = this.tableNameArray.indexOf(tableNumber);
            this.tableNameArray.splice(index, 1);
        },
        "getSelectedChartsFromTable": function(tableView, withData, withCid) {
            var tableViewCid = tableView.cid,
                chartNames = [],
                chartData,
                columnNo = null,
                chartDataObj = this.tableChartMappingObj[tableViewCid];
            _.each(chartDataObj, function(chartView, key) {
                if (chartView.isSelected) {
                    chartData = {};
                    chartData.name = key;
                    chartData.data = {};
                    if (withData) {
                        _.each(chartView.view, function(value, index) {
                            if (withData) {
                                if (withCid) {
                                    chartData.data[index] = value.getChartData();
                                } else {
                                    columnNo = tableView._getColumnNo(index);
                                    chartData.data[columnNo] = value.getChartData();
                                }
                            }
                        });

                    }
                    chartNames.push(chartData);
                }
            });
            return chartNames;
        }
    });
    MathUtilities.Tools.Graphing.Views.WindowManager = Backbone.View.extend({
        "elementsArray": null,
        "initialZindex": null,
        "defaultPosition": {
            "top": null,
            "left": null
        },
        "topOffset": null,
        "isChartPositionUpdated": null,
        "leftOffset": null,
        "$container": null,
        "chartStartIndex": 9900,
        "initialize": function() {
            var TOP_OFFSET = 40,
                LEFT_OFFSET = 70;
            this.elementsArray = [];
            this.initialZindex = this.options.initialZindex;
            this.accManagerView = this.options.accManagerView;
            if (typeof this.options.defaultTop !== "undefined") {
                this.defaultPosition.top = this.options.defaultTop;
            } else {
                this.defaultPosition.top = 0;
            }
            if (typeof this.options.defaultLeft !== "undefined") {
                this.defaultPosition.left = this.options.defaultLeft;
            } else {
                this.defaultPosition.left = 0;
            }
            if (typeof this.options.topOffset !== "undefined") {
                this.topOffset = this.options.topOffset;
            } else {
                this.topOffset = TOP_OFFSET;
            }
            if (typeof this.options.leftOffset !== "undefined") {
                this.leftOffset = this.options.leftOffset;
            } else {
                this.leftOffset = LEFT_OFFSET;
            }
            this.isChartPositionUpdated = false;
            this.$container = this.options.container;
        },
        "setDefaultPosition": function(isUpdated, position) {

            if (isUpdated === true) {
                this.defaultPosition.top = position.top;
                this.defaultPosition.left = position.left;
            } else {
                if (typeof this.options.defaultTop !== "undefined") {
                    this.defaultPosition.top = this.options.defaultTop;
                } else {
                    this.defaultPosition.top = 0;
                }
                if (typeof this.options.defaultLeft !== "undefined") {
                    this.defaultPosition.left = this.options.defaultLeft;
                } else {
                    this.defaultPosition.left = 0;
                }
            }
        },

        "findAddedElement": function($newElement) {
            var elements = this.elementsArray.filter(function(value, index) {
                return value.attr('data-column-cid') === $newElement.attr('data-column-cid') && 
                value.attr('data-chart-name') === $newElement.attr('data-chart-name');
            });
            return elements;
        },

        "newElementAdded": function($newElement) {
            var length = this.elementsArray.length,
                lastZindex,
                position,
                tabIndex;
            this.elementsArray.sort(function(firstElement, secondElement) {
                return parseInt($(firstElement).css("z-index"), 10) - parseInt($(secondElement).css("z-index"), 10);
            });
            $newElement = $($newElement);
            this.elementsArray.push($newElement);
            if (length > 0) {
                lastZindex = Number(this.elementsArray[length - 1].css("z-index")) + 1;
                tabIndex = Number(this.accManagerView.getTabIndex(this.elementsArray[length - 1].attr('id'))) - 100;
                position = this.setPosition($newElement, this.elementsArray[length - 1]);
                $newElement.css({
                    "top": position.top,
                    "left": position.left
                });
                //setPosition
            } else {
                lastZindex = this.initialZindex;
                tabIndex = this.chartStartIndex;
                position = this.setPosition($newElement);
                $newElement.css({
                    "top": position.top,
                    "left": position.left
                });
            }
            $newElement.data('position', {
                "top": position.top,
                "left": position.left
            }).css({
                "z-index": lastZindex
            }).on('mousedown', _.bind(this.bringWindowToFront, this, $newElement));
            this.accManagerView.setTabIndex($newElement.attr('id'), tabIndex);
            this.accManagerView.enableTab($newElement.attr('id'), false);
            $newElement.find('.chart-title.mathquill-rendered-math').off('mousedown.windowToFront').
                on('mousedown.windowToFront', _.bind(this.bringWindowToFront, this, $newElement));
        },
        "deleteElement": function($deleteElement) {
            var noOfWindows = this.elementsArray.length,
                counter, index, currentElement;
            for (counter = 0; counter < noOfWindows; counter++) {
                currentElement = this.elementsArray[counter];
                if ($deleteElement.is(currentElement)) {
                    index = counter;
                    this.elementsArray.splice(index, 1);
                    break;
                }
            }
            this.elementsArray.sort(function(firstElement, secondElement) {
                return parseInt($(firstElement).css("z-index"), 10) - parseInt($(secondElement).css("z-index"), 10);
            });
            if (index !== -1) {
                noOfWindows = this.elementsArray.length;
                for (counter = index; counter < noOfWindows; counter++) {
                    currentElement = this.elementsArray[counter];
                    currentElement.css({
                        "z-index": Number(currentElement.css("z-index") - 1)
                    });
                    this.accManagerView.setTabIndex(currentElement.attr('id'), Number(this.accManagerView.getTabIndex(currentElement.attr('id')) + 100));
                    this.accManagerView.enableTab(currentElement.attr('id'), false);
                }
            }
            return $deleteElement;
        },
        "bringWindowToFront": function($element) {
            var counter,
                noOfWindows = this.elementsArray.length,
                currentElement, index,
                lastZindex = Number(this.elementsArray[noOfWindows - 1].css('z-index')),
                MAX_TABINDEX = 10000,
                tabIndex = Number(this.accManagerView.getTabIndex(this.elementsArray[noOfWindows - 1].attr('id')));
            for (counter = 0; counter < noOfWindows; counter++) {
                currentElement = this.elementsArray[counter];
                if ($element.is(currentElement)) {
                    index = counter;
                    break;
                }
            }
            if (index !== -1) {
                this.elementsArray.splice(index, 1);
            }
            this.elementsArray.push($element);
            $element.css({
                "z-index": lastZindex
            });
            this.accManagerView.setTabIndex($element.attr('id'), tabIndex);
            for (counter = index; counter < noOfWindows; counter++) {
                currentElement = this.elementsArray[counter];
                currentElement.css({
                    "z-index": counter + 1
                });
                this.accManagerView.setTabIndex(currentElement.attr('id'), MAX_TABINDEX - (counter + 1) * 100);
            }
        },
        "getElementsArray": function() {
            return this.elementsArray;
        },
        "chartPositionUpdated": function() {
            this.isChartPositionUpdated = true;
        },
        "arrangeToFitElements": function() {
            var counter, length = this.elementsArray.length,
                currentElement, prevElement, position;
            this.isChartPositionUpdated = false;
            if (this.elementsArray.length > 0) {
                currentElement = this.elementsArray[0];
                position = this.setPosition(currentElement);
                currentElement.css({
                    "top": position.top,
                    "left": position.left
                }).data('position', {
                    "top": position.top,
                    "left": position.left
                });
            } else {
                return void 0;
            }
            for (counter = 1; counter < length; counter++) {
                currentElement = this.elementsArray[counter];
                prevElement = this.elementsArray[counter - 1];
                position = this.setPosition(currentElement, prevElement);
                currentElement.css({
                    "top": position.top,
                    "left": position.left
                }).data('position', {
                    "top": position.top,
                    "left": position.left
                });
            }
        },
        "setPosition": function(newElement, prevElement) {
            var prevTop,
                prevLeft, defaultTop = this.defaultPosition.top,
                defaultLeft = this.defaultPosition.left,
                newTop,
                newLeft,
                containerHt,
                containerWidth,
                prevElementPosition;
            if (typeof prevElement === "undefined") {
                newTop = defaultTop;
                newLeft = defaultLeft;
            } else {
                prevElementPosition = $(prevElement).data('position');
                prevTop = prevElementPosition.top;
                prevLeft = prevElementPosition.left;
                containerHt = this.$container.height();
                containerWidth = this.$container.width() + this.$container.offset().left;
                newTop = prevTop + this.topOffset;

                newLeft = prevLeft;
                if (newTop + newElement.height() > containerHt || newLeft + newElement.width() > containerWidth) {
                    if (this.isChartPositionUpdated === true) {
                        newTop = defaultTop;
                        newLeft = defaultLeft;
                        this.isChartPositionUpdated = false;
                    } else {
                        if (newTop + newElement.height() > containerHt && prevLeft > defaultLeft) {
                            newTop = defaultTop;
                            newLeft = defaultLeft;
                        } else {
                            newTop = defaultTop;
                            newLeft = defaultLeft + this.leftOffset;
                        }
                    }
                } else if (newTop < defaultTop || newLeft < defaultLeft) {
                    newTop = defaultTop;
                    newLeft = defaultLeft;
                }
            }
            return {
                "top": newTop,
                "left": newLeft
            };
        }

    });
}(window.MathUtilities));
