/* globals $, MathUtilities, Highcharts  */

(function() {
    "use strict";

    /**
     * Creates a table model that stores table information.
     *
     * @class MathUtilities.Components.GraphChart.Models.Chart
     * @extends Backbone.Model
     * @constructor
     */
    MathUtilities.Components.GraphChart.Models.Chart = Backbone.Model.extend({
        "defaults": function() {
            return {
                "chartOptionsData": {
                    "chartTitleSelected": null,
                    "chartTitle": null,
                    "chartAxesTitlesSelected": null,
                    "xAxisTitle": null,
                    "yAxisTitle": null,
                    "chartGridlinesSelected": null,
                    "chartLegendsSelected": null,
                    "chartAxesLinesSelected": null,
                    "chartAxesLabelsSelected": null,
                    "chartTable": null
                },
                "defaultNameTitleMap": {

                },
                "chartName": null,
                "defaultMask": null,
                "tableData": null,
                "chartData": null,
                "chartTitle": null,
                "chartLabels": null,
                "tableHeaders": null,
                "plotData": null,
                "chart": null,
                "maxX": null,
                "maxY": null,
                "minX": null,
                "hiddenSeries": null,
                "removeBoxData": [],
                "legendsSelected": true,
                "chartWithLegends": 0.75,
                "chartWithoutLegends": 1,
                "labelMathquill": null,
                "headerMathquill": null,
                "ignoreCols": null,
                "minY": null,
                "bins": null,
                "skipColumn": null,
                "indexDataOfDeselectedLegends": null,
                "tableContents": null,
                "horizontalBoxPlot": null,
                "chartSize": null,
                "chartPosition": null,
                "xAxisTitle": null,
                "currentXAxisTitle": null,
                "currentYAxisTitle": null,
                "orientationOptionHeight": null,
                "orientationOptionWidth": null,
                "yAxisTitle": null,
                "bestFit": null,
                "columnColors": null,
                "chartDefaultSize": null,
                "columnNo": null,
                "bestFitObj": {},
                "colors": ["#6732be", "#0086a7", "#ff9600", "#29c38e", "#00b9e6", "#cb3e87"]
            };
        },

        "CHART_SETTINGS": {
            "LINE_WIDTH_0": 0,
            "LINE_WIDTH_2": 1,
            "GRID_LINE_WIDTH_0": 0,
            "GRID_LINE_WIDTH_1": 1,
            "GRID_LINE_WIDTH_2": 2
        },
        /**
         * Acts as the constructor for this view, is initialized when this view's object is created.
         *
         * @method initialize
         */
        "initialize": function(options) {
            var chartName,
                chartDefaultSize = {
                    "chart": {
                        "width": 385,
                        "height": 282
                    },
                    "chartOptions": {
                        "width": 365,
                        "height": 260
                    }
                },
                chartSize = {},
                bytesLength = 8;
            this.accManager = options.accManager;
            this.equationPanelView = options.equationPanelView;
            this.set('defaultNameTitleMap', {
                "bar": this.accManager.getMessage('bar-chart-btn-text', 0),
                "column": this.accManager.getMessage('column-chart-btn-text', 0),
                "dot": this.accManager.getMessage('dot-chart-btn-text', 0),
                "box": this.accManager.getMessage('box-chart-btn-text', 0),
                "histogram": this.accManager.getMessage('histogram-chart-btn-text', 0)
            });
            this.set('defaultMask', 1 << bytesLength);
            chartName = this.get('chartName');
            if (chartName.indexOf('pie') !== -1) {
                this.setPieChartMask();
            } else if (chartName.indexOf('dot') !== -1) {
                this.setDotPlotMask();
            } else {
                this.setDefaultMask();
            }
            chartSize = MathUtilities.Components.Utils.Models.Utils.convertToSerializable(chartDefaultSize);
            this.set({
                "columnColors": [],
                "hiddenSeries": [],
                "skipColumn": [],
                "indexDataOfDeselectedLegends": [],
                "chartDefaultSize": chartDefaultSize,
                "chartSize": chartSize,
                "chartPosition": {
                    "top": 0,
                    "left": 0
                }
            });
            this.MathHelper = MathUtilities.Components.Utils.Models.MathHelper;
            this.removeBoxData = [];
            this.set({
                "horizontalBoxPlot": true,
                "bestFit": {}
            });
        },
        "MathHelper": null,
        "setPieChartMask": function() {
            var noOfBit = 1 << 1,
                defaultMask = this.get('defaultMask');
            //bit for chart title is 1;
            defaultMask |= noOfBit;
            //bit for legends is 5
            noOfBit = 1 << 5;
            defaultMask |= noOfBit;
            this.set('defaultMask', defaultMask);
        },
        "setDotPlotMask": function() {
            var noOfBit, TOTAL_BITS = 7,
                defaultMask = this.get('defaultMask'),
                counter;
            for (counter = 1; counter <= TOTAL_BITS; counter++) {
                noOfBit = 1 << counter;
                //bit for gridline is 3 and for legends is 4;
                if (counter !== 3 && counter !== 4) {
                    defaultMask |= noOfBit;
                }
            }
            this.set('defaultMask', defaultMask);
        },
        "setDefaultMask": function() {
            var noOfBit, TOTAL_BITS = 7,
                defaultMask = this.get('defaultMask'),
                counter;
            for (counter = 1; counter <= TOTAL_BITS; counter++) {
                noOfBit = 1 << counter;
                defaultMask |= noOfBit;
            }
            this.set('defaultMask', defaultMask);
        },
        "_calculateBoxChartData": function(data) {

            var DataAnalysis = MathUtilities.Components.Utils.Models.DataAnalysis,
                currentFivePointSummary,
                count = 0,
                EMPTY_ARRAY = [null, null, null, null, null], //highcharts accepts only integers or null value, so to display empty space empty array is used
                ignoreCols,
                loopVar, currentCol,
                obj,
                MINIMUM_POINTS = 5,
                points = [],
                outlierPoints = [],
                actualMaxMin = [],
                boxes = [],
                totalCol = data.length,
                ignoreCols = [];
            for (loopVar = 0; loopVar < totalCol; loopVar++) {
                if (data[loopVar].length >= MINIMUM_POINTS) {
                    currentCol = data[loopVar];
                    currentFivePointSummary = DataAnalysis.getFivePointSummary(currentCol, null, true);
                    boxes.push(currentFivePointSummary.fivePointSummary);
                    points.push(currentFivePointSummary.fivePointSummary[2]); //get median from summary.
                    outlierPoints.push(currentFivePointSummary.outlier);
                    actualMaxMin.push(currentFivePointSummary.actualMaxMin);
                } else {
                    boxes.push(EMPTY_ARRAY);
                    points.push(null);
                    actualMaxMin.push([null, null]);
                    outlierPoints.push([null]);
                    ignoreCols.push(loopVar);
                    count++;
                }
            }
            if (totalCol === count) {
                this.trigger('box-calculation-error');
                return 'error';
            }
            obj = {
                "box": boxes,
                "points": points,
                "outlierPoints": outlierPoints,
                "actualMaxMin": actualMaxMin
            };
            this.set({
                "chartData": obj,
                "ignoreCols": ignoreCols,
                "xAxisTitle": this.accManager.getMessage('dummy-chart-text', 11),
                "yAxisTitle": this.accManager.getMessage('dummy-chart-text', 12)
            });
            this.trigger("chart-points-calculated", obj);
        },
        "_setBoxChartData": function(chartData) {
            var obj, loopVar, totalSummaries, summary, points = [],
                temp, summaries = [];
            for (temp in chartData) {
                summaries.push(chartData[temp]);
            }
            totalSummaries = summaries.length;
            for (loopVar = 0; loopVar < totalSummaries; loopVar++) {
                summary = summaries[loopVar];
                points.push(summary[2]);
            }
            obj = {
                "box": summaries,
                "points": points
            };
            this.set({
                "chartData": obj,
                "xAxisTitle": this.accManager.getMessage('dummy-chart-text', 11),
                "yAxisTitle": this.accManager.getMessage('dummy-chart-text', 12)
            });
        },
        "_calculateDotChartData": function(data, columnNo, headerDelta) {
            var loopVar,
                loopVar2,
                dataEntry = [],
                lastIndex,
                count,
                points = [],
                frequencys = [],
                dataToDisplay = [],
                dataElementCount,
                colNo = columnNo || 0,
                actualColumnNo = columnNo + 1,
                dataElements = [];
            dataEntry = data[colNo];
            dataEntry = this._sortData(dataEntry);
            dataElementCount = dataEntry.length;
            for (loopVar = 0; loopVar < dataElementCount;) {
                lastIndex = dataEntry.lastIndexOf(dataEntry[loopVar]) + 1;
                for (loopVar2 = loopVar, count = 1; loopVar2 < lastIndex; loopVar2++, count++) {
                    points.push({
                        "x": dataEntry[loopVar],
                        "y": count,
                        "frequency": lastIndex - loopVar
                    });
                }
                dataElements.push(dataEntry[loopVar]);
                frequencys.push(count - 1);
                loopVar = lastIndex;
            }
            dataToDisplay = [dataElements, frequencys];
            this.set({
                "chartData": points,
                "xAxisTitle": this.accManager.getMessage('dummy-chart-text', 13)
            });
            this.trigger("chart-points-calculated", dataToDisplay, actualColumnNo + headerDelta);
        },
        "_removeDuplicates": function(arr) {
            var loopVar, arrLength, newArr = [],
                lastIndex,
                currentEntry;
            arr = this._sortData(arr);
            arrLength = arr.length;
            for (loopVar = 0; loopVar < arrLength;) {
                currentEntry = arr[loopVar];
                lastIndex = arr.lastIndexOf(currentEntry) + 1;
                newArr.push(currentEntry);
                loopVar = lastIndex;
            }
            return newArr;
        },
        "_setDotChartData": function(chartData) {
            var points = [],
                dataEntryLength, loopVar, temp, plotData = [],
                count, frequencies, loopVar2,
                header = [],
                dataEntry, frequency;
            for (temp in chartData) {
                plotData.push(chartData[temp]);
                header.push(temp);
            }
            dataEntry = plotData[0];
            frequency = plotData[1];
            dataEntryLength = dataEntry.length;
            for (loopVar = 0; loopVar < dataEntryLength; loopVar++) {
                frequencies = frequency[loopVar];
                for (loopVar2 = 0, count = 1; loopVar2 < frequencies; loopVar2++, count++) {
                    points.push({
                        "x": dataEntry[loopVar],
                        "y": count,
                        "frequency": frequencies
                    });
                }
            }
            this.set({
                "chartData": points,
                "xAxisTitle": this.accManager.getMessage('dummy-chart-text', 13)
            });
            this.trigger("chart-points-calculated", plotData);
        },
        "_setDefaultChartPropreties": function() {
            Highcharts.setOptions({
                "colors": ['#6732be', '#0086a7', '#ff9600', '#29c38e', '#00b9e6', '#cb3e87']
            });
        },
        "_calculateBarChartData": function(data) {
            this.set({
                "chartData": data,
                "xAxisTitle": this.accManager.getMessage('dummy-chart-text', 22),
                "yAxisTitle": this.accManager.getMessage('dummy-chart-text', 23)
            });
        },
        "_calculateColumnChartData": function(data) {
            this.set({
                "chartData": data,
                "xAxisTitle": this.accManager.getMessage('dummy-chart-text', 22),
                "yAxisTitle": this.accManager.getMessage('dummy-chart-text', 23)
            });
        },
        "_calculatePieChartData": function(data) {
            var points = [],
                loopVar,
                labels = this.get('chartLabels'),
                col = data[0],
                colLength = col.length;
            for (loopVar = 0; loopVar < colLength; loopVar++) {
                points.push([labels[loopVar], col[loopVar]]);
            }
            this.set('chartData', points);
        },
        "_sortData": function(data) {
            var loopVar1, loopVar2, temp, sortOpti,
                dataLength = data.length;
            for (loopVar1 = 0; loopVar1 < dataLength; loopVar1++) {
                sortOpti = dataLength - loopVar1 - 1;
                for (loopVar2 = 0; loopVar2 < sortOpti; loopVar2++) {
                    if (data[loopVar2] > data[loopVar2 + 1]) {
                        temp = data[loopVar2];
                        data[loopVar2] = data[loopVar2 + 1];
                        data[loopVar2 + 1] = temp;
                    }
                }
            }
            return data;
        },
        "_sortPointsByX": function(data) {
            var loopVar1, loopVar2, temp, sortOpti,
                firstData,
                dataLength = data.length;
            dataLength = data[0].length;
            for (loopVar1 = 0; loopVar1 < dataLength; loopVar1++) {
                sortOpti = dataLength - loopVar1 - 1;
                for (loopVar2 = 0; loopVar2 < sortOpti; loopVar2++) {
                    firstData = data[0];
                    if (firstData[loopVar2] > firstData[loopVar2 + 1]) {
                        temp = firstData[loopVar2];
                        firstData[loopVar2] = firstData[loopVar2 + 1];
                        firstData[loopVar2 + 1] = temp;
                        temp = data[1][loopVar2];
                        data[1][loopVar2] = data[1][loopVar2 + 1];
                        data[1][loopVar2 + 1] = temp;
                    }
                }
            }
            return data;
        },
        "_calculateHistogramData": function(data, columnNo, headerDelta) {

            var Chart = MathUtilities.Components.GraphChart.Models.Chart,
                loopVar,
                loopVar2,
                points = [],
                count,
                ranges = [],
                obj,
                val1,
                val2,
                conversionType = "floor",
                LIMIT = this.equationPanelView.getPrecision(),
                actualColumnNo = columnNo + 1,
                value = this._sortData(data[1]),
                dataRange = this._removeDuplicates(data[0]),
                dataRangeLength = dataRange.length - 1,
                valueLength = value.length;

            for (loopVar = 0; loopVar < dataRangeLength; loopVar++) {
                count = 0;
                if (loopVar === 0) {
                    val1 = Chart._getDisplayableDataValues(dataRange[loopVar], LIMIT, true, true, conversionType);
                } else {
                    val1 = Chart._getDisplayableDataValues(dataRange[loopVar], LIMIT, true, true);
                }
                val2 = Chart._getDisplayableDataValues(dataRange[loopVar + 1], LIMIT, true, true);
                for (loopVar2 = 0; loopVar2 < valueLength; loopVar2++) {
                    if (val1 <= value[loopVar2] && val2 > value[loopVar2]) {
                        count++;
                    }
                }
                if (loopVar === 0) {
                    ranges.push(Chart._getDisplayableDataValues(dataRange[loopVar], LIMIT, false, false, conversionType) + " - " +
                        Chart._getDisplayableDataValues(dataRange[loopVar + 1], LIMIT, false));
                } else {
                    ranges.push(Chart._getDisplayableDataValues(dataRange[loopVar], LIMIT, false, false) + " - " +
                        Chart._getDisplayableDataValues(dataRange[loopVar + 1], LIMIT, false));
                }
                points.push(count);
            }
            obj = {
                "ranges": ranges,
                "points": points
            };
            this.set({
                "chartData": obj,
                "xAxisTitle": this.accManager.getMessage('dummy-chart-text', 8),
                "yAxisTitle": this.accManager.getMessage('dummy-chart-text', 9)
            });
            this.trigger("chart-points-calculated", obj, actualColumnNo + headerDelta);
        },
        "_setHistogramData": function(chartData) {
            var obj, dataRange, frequency, temp, plotData = [],
                header = [];
            for (temp in chartData) {
                plotData.push(chartData[temp]);
                header.push(temp);
            }
            dataRange = plotData[0];
            frequency = plotData[1];
            obj = {
                "ranges": dataRange,
                "points": frequency
            };
            this.set({
                "chartData": obj,
                "xAxisTitle": this.accManager.getMessage('dummy-chart-text', 8),
                "yAxisTitle": this.accManager.getMessage('dummy-chart-text', 9)
            });
            this.trigger("chart-points-calculated", obj);
        },
        "_pointsToPlotCalculated": function(chartName, points) {

            var obj, data = [],
                header = [],
                chartData, ignoreCol = this.get("ignoreCols"),
                Utils = MathUtilities.Components.Utils.Models.Utils,
                accManager = this.accManager;
            chartData = this.get("chartData");
            switch (chartName) {
                case 'dot':
                    data = this._sortPointsByX(points);
                    header.push(accManager.getMessage('dummy-chart-text', 13), accManager.getMessage('dummy-chart-text', 9));
                    break;
                case 'histogram':
                    data.push(chartData.ranges, chartData.points);
                    header.push(accManager.getMessage('dummy-chart-text', 8), accManager.getMessage('dummy-chart-text', 9));
                    break;
                case 'box':
                    data = chartData.box;
                    header = this.get('tableHeaders');
                    break;
            }
            obj = {
                "data": data,
                "headers": header
            };
            obj = Utils.convertToSerializable(obj);
            if (chartName === "box") {
                obj.ignoreCol = ignoreCol;
            }
            this.trigger("add-table-column", obj);
        },

        "convertTableDataForPie": function(tableContents, columnNo) {
            var tableLabels = tableContents.labels,
                data = tableContents.points,
                labels = [],
                headers,
                currentNumber,
                colNo = columnNo || 0,
                counter, col = [],
                count, currentCol = data[colNo],
                colLength = currentCol.length,
                updatedData = [];



            for (count = 0; count < colLength; count++) {
                currentNumber = Number(currentCol[count]);
                if (isFinite(currentNumber) && currentCol[count] !== '' || currentNumber > 0) {
                    col.push(currentNumber);
                    if (tableLabels[count] === '' || typeof tableLabels[count] === 'undefined') {
                        labels.push(count + 1 + '');
                    } else {
                        labels.push(tableLabels[count]);
                    }
                }
            }
            updatedData.push(col);
            currentCol = updatedData[0];
            headers = tableContents.headers;
            this.set({
                "chartLabels": labels,
                "tableHeaders": headers
            });
            return updatedData;
        },
        "changeBlankTableCellValue": function(tableContents) {

            var data = tableContents.points,
                totalCols = data.length,
                colLength,
                labels = [],
                headers,
                currentLabel,
                currentNumber,
                counter, col = [],
                count,
                currentCol,
                updatedData = [];
            for (counter = 0; counter < totalCols; counter++) {
                currentCol = data[counter];
                colLength = currentCol.length;
                for (count = 0; count < colLength; count++) {
                    currentNumber = Number(currentCol[count]);
                    if (!isFinite(currentNumber) || currentCol[count] === '') {
                        col.push({
                            "y": 0,
                            "color": 'rgba(255, 255, 255, 0)',
                            "stroke": 'rgba(255, 255, 255, 0)',
                            "orgColor": tableContents.columnColors[counter],
                            "orgVal": currentCol[count]
                        });
                    } else {
                        col.push({
                            "y": currentNumber
                        });
                    }
                }
                updatedData.push(col);
                col = [];
            }
            if (updatedData.length) {
                colLength = updatedData[0].length;
            }

            for (counter = 0; counter < colLength; counter++) {
                if (tableContents.labels.length > 0) {
                    currentLabel = tableContents.labels[counter];
                    labels.push(currentLabel);
                } else {
                    labels.push((counter + 1).toString());
                }
            }
            headers = tableContents.headers;
            this.set({
                "chartLabels": labels,
                "tableHeaders": headers,
                "tableHeadersAcc": tableContents.headersAcc
            });
            return updatedData;
        },
        "removeBlankTableCell": function(tableContents) {
            var data = tableContents.points,
                totalCols = data.length,
                colLength, headers, currentNumber,
                counter, col = [],
                count, currentCol, updatedData = [];
            for (counter = 0; counter < totalCols; counter++) {
                currentCol = data[counter];
                colLength = currentCol.length;
                for (count = 0; count < colLength; count++) {
                    if (currentCol[count] !== '' && typeof currentCol[count] !== 'undefined') {
                        currentNumber = Number(currentCol[count]);
                        if (isFinite(currentNumber)) {
                            col.push(currentNumber);
                        }
                    }
                }
                updatedData.push(col);
                col = [];
            }
            headers = tableContents.headers;
            this.set({
                "tableData": updatedData,
                "chartLabels": tableContents.labels,
                "tableHeaders": headers
            });
            return updatedData;
        },

        "_getSeries": function(chartName, markerObj, columnNo) {

            var allSeries = [],
                series, points = [],
                outlierPoints = [],
                dataLength,
                loopVar,
                outliersLength,
                index,
                dotSeries,
                outlierSeries,
                boxData = [],
                MIN = 0,
                Q1 = 1,
                MEDIAN = 2,
                Q3 = 3,
                MAX = 4,
                headers = this.get('tableHeaders'),
                colors = this.get('columnColors'),
                data = this.get('chartData');
            switch (chartName) {
                case "column":
                case "bar":
                    dataLength = data.length;
                    for (loopVar = dataLength - 1; loopVar >= 0; loopVar--) {
                        series = {
                            "type": chartName,
                            "data": data[loopVar],
                            "name": headers[loopVar],
                            "color": colors[loopVar]
                        };
                        allSeries.unshift(series);
                    }
                    break;
                case "dot":
                    if (!markerObj) {
                        markerObj = {
                            "lineColor": '#000',
                            "lineWidth": 2
                        };
                    }
                    series = {
                        "type": 'scatter',
                        "data": data,
                        "lineWidth": 0,
                        "name": 'Frequency',
                        "marker": markerObj
                    };
                    allSeries.unshift(series);
                    break;
                case 'box':
                    if (!markerObj) {
                        markerObj = {
                            "fillColor": '#ffc000'
                        };
                    }
                    dataLength = data.points.length;
                    for (loopVar = 0; loopVar < dataLength; loopVar++) {
                        points.push({
                            "y": data.points[loopVar],
                            "color": colors[loopVar],
                            "marker": {
                                "states": {
                                    "hover": {
                                        "fillColor": colors[loopVar]
                                    }
                                }
                            }
                        });
                    }
                    dotSeries = {
                        "type": 'scatter',
                        "data": points,
                        "lineWidth": 0,
                        "name": 'Median',

                        "showInLegend": false
                    };
                    dataLength = data.box.length;
                    for (loopVar = 0; loopVar < dataLength; loopVar++) {
                        boxData.push({
                            "low": data.box[loopVar][MIN],
                            "q1": data.box[loopVar][Q1],
                            "median": data.box[loopVar][MEDIAN],
                            "q3": data.box[loopVar][Q3],
                            "high": data.box[loopVar][MAX],
                            "actualMax": data.actualMaxMin[loopVar][1],
                            "actualMin": data.actualMaxMin[loopVar][0]
                        });
                    }
                    series = {
                        "type": 'boxplot',
                        "data": boxData,
                        "name": 'Summary'
                    };
                    dataLength = data.outlierPoints.length;
                    for (loopVar = 0; loopVar < dataLength; loopVar++) {
                        outliersLength = data.outlierPoints[loopVar].length;
                        for (index = 0; index < outliersLength; index++) {
                            outlierPoints.push({
                                "x": loopVar,
                                "y": data.outlierPoints[loopVar][index],
                                "color": colors[loopVar],
                                "marker": {
                                    "states": {
                                        "hover": {
                                            "fillColor": colors[loopVar]
                                        }
                                    }
                                }
                            });
                        }
                    }
                    outlierSeries = {
                        "type": 'scatter',
                        "data": outlierPoints,
                        "lineWidth": 0,
                        "name": 'Outlier',
                        "showInLegend": false,
                        "marker": {
                            "symbol": "circle"
                        }
                    };
                    allSeries.unshift(series, dotSeries, outlierSeries);
                    break;
                case 'histogram':
                    if (data === null || data === void 0) {
                        allSeries = [];
                    } else {
                        series = {
                            "type": 'column',
                            "data": data.points,
                            "name": 'Frequency',
                            "color": colors[columnNo]
                        };
                        allSeries.unshift(series);
                    }
                    break;
                case 'pie':
                    series = {
                        "type": chartName,
                        "data": data
                    };
                    allSeries.unshift(series);
                    break;
            }
            return allSeries;
        },
        "_updateChartData": function(tableContents, chartOptions, histogramData, columnNo, headerDelta) {
            var chartName = this.get('chartName'),
                data, labels, headers, chartData, errorMessage = '',
                allSeries, dataLength, colorLength, newColorsLength,
                loopVar, color,
                colNo = columnNo,
                colors = this.get('columnColors'),
                chart = this.get('chart');

            switch (chartName) {
                case "column":
                case "bar":
                    data = this.changeBlankTableCellValue(tableContents);
                    this._calculateBarChartData(data);
                    labels = this.get("chartLabels");
                    chart.xAxis.categories = labels;
                    if (data[0]) {
                        dataLength = data[0].length;
                    }
                    chart.xAxis.min = 0;
                    chart.xAxis.max = dataLength - 1;
                    break;
                case 'dot':
                    data = this.removeBlankTableCell(tableContents);
                    this._calculateDotChartData(data, colNo, headerDelta);
                    data = this.get('chartData');
                    dataLength = data.length;
                    if (data && data[0]) {
                        chart.xAxis.min = data[0][0];
                        chart.xAxis.max = data[dataLength - 1][0];
                    }
                    break;
                case 'box':
                    data = this.removeBlankTableCell(tableContents);
                    errorMessage = this._calculateBoxChartData(data);
                    headers = this.get('tableHeaders');
                    chart.xAxis.categories = headers;
                    chart.xAxis.min = 0;
                    chart.xAxis.max = headers.length - 1;
                    chart.plotOptions.boxplot.colors = colors;

                    break;
                case "pie":
                    data = this.convertTableDataForPie(tableContents, colNo);
                    this._calculatePieChartData(data);
                    chartData = this.get('chartData');
                    dataLength = chartData.length;
                    colors = this.get('colors');

                    colorLength = colors.length;
                    newColorsLength = dataLength - colorLength;
                    for (loopVar = 0; loopVar < newColorsLength; loopVar++) {
                        color = this.generateColor();
                        if (color !== void 0 && colors.indexOf(color) === -1) {
                            colors.push(color);
                        } else {
                            loopVar--;
                        }
                    }
                    chart.plotOptions.pie.colors = colors;
                    this.set('columnColors', colors);
                    if (dataLength === 1) {
                        chart.plotOptions.pie.borderWidth = 0;
                    } else {
                        chart.plotOptions.pie.borderWidth = 1;
                    }
                    break;
                case 'histogram':
                    data = histogramData || this.removeBlankTableCell(tableContents);
                    data = this._updateHistogramRangeThroughBins(data.slice(), colNo);
                    errorMessage = this._calculateHistogramData(data, colNo, headerDelta);
                    if (errorMessage !== 'error') {
                        chartData = this.get('chartData');
                        chart.xAxis.categories = chartData.ranges;
                    }
                    chart.xAxis.min = 0;
                    chart.xAxis.max = chartData.ranges.length - 1;
                    break;
            }
            if (errorMessage === 'error') {
                return errorMessage;
            }
            allSeries = this._getSeries(chartName, tableContents.markerObj, colNo);

            if (chartOptions) {
                chart = this.mergeRecursive(chart, chartOptions);
            }
            chart.series = allSeries;
            return chart;
        },
        "_updateHistogramRangeThroughBins": function(data, columnNo) {
            var loopVar,
                updatedRange = [],
                colNo = columnNo || 0,
                temp, bins = this.get('bins'),
                interval,
                arrayOfRange = data[colNo];

            if (!arrayOfRange || arrayOfRange.length === 0) {
                data = [
                    [],
                    []
                ]; //blank array is intentionally returned
                return data;
            }
            arrayOfRange = this._sortData(arrayOfRange.slice());
            updatedRange[0] = arrayOfRange[0];
            interval = bins;
            bins = this.getBinsFromInterval(arrayOfRange, bins);
            temp = updatedRange[0];
            for (loopVar = 1; loopVar <= bins; loopVar++) {
                temp += interval;
                updatedRange.push(temp);
            }
            data[0] = updatedRange;
            data[1] = arrayOfRange;
            return data;
        },
        "getBinsFromInterval": function(arrayOfRange, interval) {
            var intervalArray = this.getIntervalArray(arrayOfRange),
                TOLERANCE = 1,
                lengthOfArrayRange = arrayOfRange.length;
            if (interval === null) {
                return null;
            }
            if (intervalArray.indexOf(interval) !== -1) {
                return intervalArray.indexOf(interval) + 2; //increment interval by 2
            }
            return Math.ceil((arrayOfRange[lengthOfArrayRange - 1] - (arrayOfRange[0] - TOLERANCE)) / interval);
        },
        "getIntervalArray": function(arrayOfRange) {
            var Chart = MathUtilities.Components.GraphChart.Models.Chart,
                intervalArray = [],
                TOLERANCE = 1,
                bins, currentValue, LIMIT = 3,
                MIN_BINS_VALUE = 2,
                MAX_BINS_VALUE = 10,
                lengthOfArrayRange = arrayOfRange.length,
                rangeDifference = arrayOfRange[lengthOfArrayRange - 1] - (arrayOfRange[0] - TOLERANCE);
            for (bins = MIN_BINS_VALUE; bins <= MAX_BINS_VALUE; bins++) {
                currentValue = rangeDifference / bins;
                intervalArray.push(Number(currentValue.toFixed(LIMIT)));
            }
            return intervalArray;
        },
        "generateColor": function() {
            var color = '#' + ((1 << 24) * Math.random() | 0).toString(16),
                COLOR_LENGTH = 7;
            if (color.length === COLOR_LENGTH && color !== '#fff') {
                return color;
            }
            this.generateColor();

        },
        "_setHighChart": function(chartName, markerObj, chartOptions, columnNo) {
            var ChartModel = MathUtilities.Components.GraphChart.Models.Chart,
                commonChartOptions, color,
                colorLength, newColorsLength,
                allSeries = [],
                chart, loopVar, dataLength,
                accManager = this.accManager,
                THREE_BYTES_LENGTH = 24,
                colors = this.get('columnColors'),
                labels = this.get('chartLabels'),
                headers = this.get('tableHeaders'),
                data = this.get('chartData');
            if (data instanceof Array && data[0]) {
                dataLength = data[0].length;
            }
            allSeries = this._getSeries(chartName, markerObj, columnNo);
            commonChartOptions = ChartModel.commonChartOptions(allSeries);
            switch (chartName) {
                case "column":
                case "bar":
                    chart = ChartModel.getBarChart(accManager);
                    chart.xAxis.categories = labels;
                    chart.xAxis.min = 0;
                    chart.xAxis.max = dataLength - 1;
                    break;
                case 'dot':
                    dataLength = data.length;
                    chart = ChartModel.getDotChart(accManager);
                    if (data && data[0]) {
                        chart.xAxis.min = data[0][0];
                        chart.xAxis.max = data[dataLength - 1][0];
                    }
                    break;
                case 'box':
                    chart = ChartModel.getBoxChart(accManager);
                    chart.xAxis.categories = headers;
                    chart.xAxis.min = 0;
                    chart.xAxis.max = headers.length - 1;
                    chart.plotOptions.boxplot.colors = colors;
                    if (!chart.chart) {
                        chart.chart = {};
                    }
                    chart.chart.inverted = true;
                    chart.xAxis.reversed = false;
                    break;
                case 'histogram':
                    chart = ChartModel.getHistogramChart(accManager);
                    chart.xAxis.categories = data.ranges;
                    chart.xAxis.min = 0;
                    chart.xAxis.max = data.ranges.length - 1;
                    break;
                case 'pie':
                    dataLength = data.length;
                    colors = this.get('colors');
                    colorLength = colors.length;
                    newColorsLength = dataLength - colorLength;
                    for (loopVar = 0; loopVar < newColorsLength; loopVar++) {
                        color = this.generateColor();
                        if (color !== void 0 && colors.indexOf(color) === -1) {
                            colors.push(color);
                        } else {
                            loopVar--;
                        }
                    }
                    chart = ChartModel.getPieChart(accManager);
                    chart.plotOptions.pie.colors = colors;
                    if (dataLength === 1) {
                        chart.plotOptions.pie.borderColor = colors;
                    } else {
                        chart.plotOptions.pie.borderColor = "#fff";
                    }
                    this.set('columnColors', colors);
                    break;
            }
            chart = jQuery.extend(true, commonChartOptions, chart);
            if (chartName === "dot") {
                chart.xAxis.gridLineWidth = 0;
                chart.yAxis.gridLineWidth = 0;
            }
            if (chartOptions) {
                chart = jQuery.extend(true, chart, chartOptions);
            }
            this.set('chart', chart);

        }
    }, {
        "_getDisplayableDataValues": function(number, limit, onlyLatex, onlyNumber, conversionType) {
            var numberString = number.toString(),
                numberArr = [],
                indexOfCDot,
                MathHelper = MathUtilities.Components.Utils.Models.MathHelper;
            if (number === "") {
                return number;
            }
            if (isFinite(number)) {
                number = Number(number);
            }
            numberString = MathHelper._convertDisplayToAppliedPrecisionForm(number, limit, conversionType);
            if (!onlyLatex) {
                indexOfCDot = numberString.indexOf("\\cdot10^{");
                if (indexOfCDot !== -1) {
                    numberArr = numberString.split("\\cdot10^{");
                    numberString = numberArr[0] + "* 10<sup>" + numberArr[1].split("}")[0] + "</sup>";
                }
            }
            if (onlyNumber) {
                numberString = numberString.replace(' \\cdot10^{', 'e').replace('}', '');
                numberString = Number(numberString);
            }
            return numberString;
        },
        "hasMinimumLength": function(points, reqLength) {
            var counter,
                pointsLength = points.length;
            for (counter = 0; counter < pointsLength; counter++) {
                if (points[counter].length < reqLength) {
                    return false;
                }
            }
            return true;
        },
        "removeBlankCells": function(data, replaceWithZero) {
            var counter1,
                counter2,
                points,
                length2,
                length1 = data.length;
            for (counter1 = 0; counter1 < length1; counter1++) {
                points = data[counter1];
                length2 = points.length;
                for (counter2 = 0; counter2 < length2; counter2++) {
                    if (points[counter2] === '' || !isFinite(Number(points[counter2]))) {
                        if (replaceWithZero) {
                            points[counter2] = 0;
                        } else {
                            points.splice(counter2, 1);
                            length2--;
                            counter2--;
                        }
                    }
                }
                if (points.length === 0) {
                    data.splice(counter1, 1);
                    length1--;
                    counter1--;
                }
            }
            return data;
        },
        "commonChartOptions": function(series) {
            return {
                "chart": {
                    "spacing": [15, 15, 15, 15],
                    "borderRadius": '12px'
                },
                "title": {
                    "text": ''
                },
                "xAxis": {
                    "lineColor": "#6c6c6c",
                    "tickWidth": 1,
                    "lineWidth": 1,
                    "gridLineWidth": 1,
                    "title": {
                        "text": ''
                    },
                    "labels": {
                        "enabled": true,
                        "useHTML": true
                    }
                },
                "yAxis": {
                    "labels": {
                        "autoRotation": false
                    }
                },
                "legend": {
                    "enabled": false,
                    "useHTML": true,
                    "align": "right",
                    "verticalAlign": "middle",
                    "layout": "vertical",
                    "itemStyle": {
                        "color": "#000"
                    },
                    "itemHoverStyle": {
                        "cursor": "default",
                        "color": "#000"
                    }
                },
                "tooltip": {
                    "style": {
                        "padding": 2 // 2px padding so that border is seen for tool-tip
                    }
                },
                "plotOptions": {
                    "spline": {
                        "states": {
                            "hover": {
                                "enabled": true,
                                "marker": {
                                    "enabled": true,
                                    "symbol": "circle",
                                    "radius": 4
                                }
                            }
                        }
                    },

                    "series": {
                        "events": {
                            "legendItemClick": function() {
                                return false;
                            }
                        }
                    }
                },
                "credits": {
                    "enabled": false
                },
                "series": series
            };
        },
        "getBarChart": function(accManager) {
            return {
                "plotOptions": {
                    "series": {
                        "minPointLength": 1,
                        "borderColor": "rgba(255, 255, 255, 0)",
                        "marker": {
                            "states": {
                                "hover": {
                                    "radius": 5
                                }
                            }
                        },
                        "point": {
                            "events": {
                                "mouseOut": function() {
                                    if (this.y === 0) {
                                        this.options.stroke = 'rgba(255, 255, 255, 0)';
                                        this.options.color = 'rgba(255, 255, 255, 0)';
                                        this.stroke = 'rgba(255, 255, 255, 0)';
                                        this.color = 'rgba(255, 255, 255, 0)';
                                    }
                                }
                            }
                        }
                    }
                },
                "xAxis": {
                    "reversed": false
                },
                "tooltip": {
                    "useHTML": true,
                    "backgroundColor": '#fff',
                    "formatter": function() {
                        if (this.point.orgVal === '') {
                            return false;
                        }
                        var Chart = MathUtilities.Components.GraphChart.Models.Chart,
                            precision = Chart.PRECISION_FOR_CHARTS,
                            $mathquillLabel,
                            $mathquill;
                        if (this.point.options.orgColor) {
                            this.point.options.stroke = this.point.options.orgColor;
                            this.point.options.color = this.point.options.orgColor;
                            this.point.stroke = this.point.options.orgColor;
                            this.point.color = this.point.options.orgColor;
                        }
                        if (typeof this.point.barX !== "undefined") {
                            $mathquillLabel = $(MathUtilities.Components.GraphChart.templates['chart-mathquill']().trim());
                            $mathquillLabel.find('.chart-mathquill').mathquill('editable').mathquill('revert')
                                .mathquill().mathquill('latex', Chart._getDisplayableDataValues(this.x, precision));
                            return '<div>' + $mathquillLabel.prop('outerHTML') + '<br/>' +
                                accManager.getMessage('dummy-chart-text', 13) + ': ' + Chart._getDisplayableDataValues(this.y, precision) + '</div>';
                        }
                        return Chart._getDisplayableDataValues(this.x, precision) + ", " + Chart._getDisplayableDataValues(this.y, precision);
                    }
                },
                "yAxis": {
                    "lineColor": "#6c6c6c",
                    "lineWidth": 1,
                    "tickWidth": 1,
                    "reversed": false,
                    "startOnTick": true,
                    "gridLineWidth": 1,
                    "title": {
                        "text": ""
                    },
                    "labels": {
                        "enabled": true,
                        "useHTML": true
                    }
                }
            };
        },

        "getDotChart": function(accManager) {
            return {
                "chart": {
                    "spacing": [20, 20, 20, 20],
                    "borderRadius": "12px"
                },
                "plotOptions": {
                    "series": {
                        "pointStart": 0,
                        "marker": {
                            "states": {
                                "hover": {
                                    "radius": 5
                                }
                            }
                        }
                    },
                    "scatter": {}
                },
                "xAxis": {
                    "gridLineWidth": 0
                },
                "tooltip": {
                    "backgroundColor": "#fff",
                    "formatter": function() {
                        var Chart = MathUtilities.Components.GraphChart.Models.Chart,
                            precision = Chart.PRECISION_FOR_CHARTS;

                        if (this.series.name === "Frequency") {
                            return accManager.getMessage('dummy-chart-text', 9) + ': ' +
                                Chart._getDisplayableDataValues(this.point.frequency, precision) + '<br>' +
                                accManager.getMessage('dummy-chart-text', 13) + ': ' +
                                Chart._getDisplayableDataValues(this.point.x, precision);
                        }
                        return Chart._getDisplayableDataValues(this.x, precision) + ", " + Chart._getDisplayableDataValues(this.y, precision);
                    }
                },
                "yAxis": {
                    "lineColor": "#6c6c6c",
                    "gridLineWidth": 0,
                    "title": {
                        "text": ""
                    },
                    "labels": {
                        "enabled": false,
                        "useHTML": true
                    }
                }
            };
        },
        "getBoxChart": function(accManager) {
            return {
                "tooltip": {
                    "backgroundColor": "#fff",
                    "formatter": function() {
                        var Chart = MathUtilities.Components.GraphChart.Models.Chart,
                            precision = Chart.PRECISION_FOR_CHARTS,
                            $mathquillLabel,
                            $mathquill;
                            console.log(precision);
                        if (this.point.box) {
                            return '<b>' + accManager.getMessage('dummy-chart-text', 14) + '</b><br/>' +
                                accManager.getMessage('dummy-chart-text', 15) + Chart._getDisplayableDataValues(this.point.actualMax, precision) + '<br/>' +
                                accManager.getMessage('dummy-chart-text', 16) + Chart._getDisplayableDataValues(this.point.q3, precision) + '<br/>' +
                                accManager.getMessage('dummy-chart-text', 17) + Chart._getDisplayableDataValues(this.point.median, precision) + '<br/>' +
                                accManager.getMessage('dummy-chart-text', 18) + Chart._getDisplayableDataValues(this.point.q1, precision) + '<br/>' +
                                accManager.getMessage('dummy-chart-text', 19) + Chart._getDisplayableDataValues(this.point.actualMin, precision) + '<br/>';
                        } else if (this.series.name === 'Median') {
                            $mathquillLabel = $(MathUtilities.Components.GraphChart.templates['chart-mathquill']().trim());
                            $mathquill = $mathquillLabel.find('.chart-mathquill');
                            MathUtilities.Components.MathEditor.Views.MathEditor.createDisabledMathquill($mathquill,
                                Chart._getDisplayableDataValues(this.x, precision));

                            return '<div>' + $mathquillLabel.prop('outerHTML') + '</div>' + '<br/>' +
                                accManager.getMessage('dummy-chart-text', 17) + Chart._getDisplayableDataValues(this.y, precision);
                        }
                        if (this.series.name === 'Outlier') {
                            $mathquillLabel = $(MathUtilities.Components.GraphChart.templates['chart-mathquill']().trim());
                            $mathquill = $mathquillLabel.find('.chart-mathquill');
                            MathUtilities.Components.MathEditor.Views.MathEditor.createDisabledMathquill($mathquill,
                                Chart._getDisplayableDataValues(this.x, precision));

                            return '<div>' + $mathquillLabel.prop('outerHTML') + '</div>' + 'Outlier: ' + Chart._getDisplayableDataValues(this.y, precision);
                        }
                        return Chart._getDisplayableDataValues(this.x, precision) + ", " + Chart._getDisplayableDataValues(this.y, precision);
                    }
                },
                "xAxis": {},
                "plotOptions": {
                    "boxplot": {
                        "colorByPoint": true,
                        "fillColor": "#a6a6a6",
                        "lineWidth": 0,
                        "medianColor": "rgba(255, 255, 255, 0)",
                        "medianWidth": 2,
                        "stemColor": "#595959",
                        "color": "#a6a6a6",
                        "stemWidth": 2,
                        "whiskerColor": "#595959",
                        "whiskerLength": "15%",
                        "whiskerWidth": 1
                    },
                    "series": {
                        "marker": {
                            "states": {
                                "hover": {
                                    "enabled": true,
                                    "radius": 5
                                }
                            }
                        }
                    },
                    "scatter": {
                        "states": {
                            "hover": {
                                "marker": {
                                    "enabled": true,
                                    "symbol": "circle"
                                }
                            }
                        }
                    }
                },
                "yAxis": {
                    "lineColor": "#6c6c6c",
                    "lineWidth": 1,
                    "tickWidth": 1,
                    "gridLineWidth": 1,
                    "title": {
                        "text": ""
                    },
                    "labels": {
                        "enabled": true,
                        "useHTML": true
                    }
                }
            };
        },
        "backgroundColor": "#fff",

        "getPieChart": function(accManager) {
            return {
                "plotOptions": {
                    "pie": {
                        "point": {
                            "events": {
                                "legendItemClick": function() {
                                    return false;
                                }
                            }
                        },
                        "dataLabels": {
                            "enabled": false
                        },
                        "showInLegend": true
                    },
                    "colors": ["#6732be", "#0086a7", "#ff9600", "#29c38e", "#00b9e6", "#cb3e87"]
                },
                "tooltip": {
                    "backgroundColor": "#fff",
                    "formatter": function() {
                        var Chart = MathUtilities.Components.GraphChart.Models.Chart,
                            precision = Chart.PRECISION_FOR_CHARTS,
                            $mathquillLabel = $(MathUtilities.Components.GraphChart.templates['chart-mathquill']().trim()),
                            $mathquill;
                        $mathquill = $mathquillLabel.find('.chart-mathquill').mathquill('editable');
                        MathUtilities.Components.MathEditor.Views.MathEditor.createDisabledMathquill($mathquill,
                            Chart._getDisplayableDataValues(this.point.name, precision));
                        return '<div>' + $mathquillLabel.prop('outerHTML') + 'Value: ' +
                            Chart._getDisplayableDataValues(this.point.y, precision) + '</div>';
                    }
                },
                "xAxis": {
                    "minPadding": 0.05,
                    "maxPadding": 0.05
                }
            };
        },
        "getHistogramChart": function(accManager) {
            return {
                "plotOptions": {
                    "series": {
                        "borderColor": "#000",
                        "pointPadding": 0.0,
                        "groupPadding": 0.0,
                        "marker": {
                            "states": {
                                "hover": {
                                    "radius": 5
                                }
                            }
                        }
                    }
                },
                "tooltip": {
                    "backgroundColor": "#fff",
                    "formatter": function() {
                        var Chart = MathUtilities.Components.GraphChart.Models.Chart,
                            precision = Chart.PRECISION_FOR_CHARTS;

                        if (this.series.name === "Frequency") {
                            return '<b>' + Chart._getDisplayableDataValues(this.x, precision) + '</b>' + '<br/>' +
                                accManager.getMessage('dummy-chart-text', 13) + ': ' +
                                Chart._getDisplayableDataValues(this.y, precision);
                        }
                        return Chart._getDisplayableDataValues(this.point.x + 1, precision) + ", " +
                            Chart._getDisplayableDataValues(this.y, precision);
                    }
                },
                "xAxis": {},
                "yAxis": {
                    "allowDecimals": false,
                    "lineColor": '#6c6c6c',
                    "lineWidth": 1,
                    "tickWidth": 1,
                    "gridLineWidth": 1,
                    "title": {
                        "text": ""
                    },
                    "labels": {
                        "enabled": true,
                        "useHTML": true,
                        "autoRotation": 45
                    }
                }
            };
        },

        "PRECISION_FOR_CHARTS": MathUtilities.Components.Utils.Models.MathHelper.DEFAULT_PRECISION_VALUE_GRAPHING_TOOL 
    });
})();
