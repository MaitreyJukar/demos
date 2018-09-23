var equations = new Array();
var gridGraphView = null;
var object = null;
var plotterView
$(document).ready(function () {
    //    $(".zoom-button").on('click', zoomGrid);
    updateEquation();
    //    model = new PlotModel();
    //var gridGraphModel = new GridGraph();
    //    gridGraphView = new GridGraphView({ model: gridGraphModel, el: $("#graph-container"), canvasId: 'nodeCanvas' });
    gridGraphView = new MathUtilities.Components.Graph.Views.GridGraph({ el: $("#input-container"), option: { canvasId: 'nodeCanvas', canvasHeight: 800, canvasWidth: 800, xAxisMinValue: -10, xAxisMaxValue: 10, zoomInButton: 'zoom-in', zoomOutButton: 'zoom-out', graphTypeButton: 'graph-type'} })
    plotterView = new MathUtilities.Components.Graph.Views.plotterView({ graphView: gridGraphView });
    //object = new PlotModel();
    //object.points = [-5, 5];
    //object.color = 'green';
    //object.thickness = 3;
    //gridGraphView.drawPoint(object);
    $('#calculate-tokens').on('click', callParser);
    $('#equation').on('change', updateEquation);

    $('#view-rules').on('click', showRules);
    MathUtilities.Components.EquationEngine.Models.Parser._deploy = false;
    MathUtilities.Components.EquationEngine.Models.Parser._debugFlag.rules = false;
    MathUtilities.Components.EquationEngine.Models.Parser._debugFlag.common = true;
//    gridGraphView.on('graph:zoom-pan', redrawPlot);
    //ParseEquation(equationData);
});

function redrawPlot() {

    for (var equationCounter = 0; equationCounter < equations.length; equationCounter++) {
        plot(equations[equationCounter]);
    }
}

function printProcessingTime(id, profiles, profileId) {
    var $processingTime = $('<span></span>');
    $(id).append($processingTime);
    $processingTime.addClass('processing-time').css({ "color": '#FF0000' }).append(' Time:' + profiles[profileId] + 'ms');
}

function callParser() {
    $('#production-rules-display').html('');
    $('#tokens-display-container').html('');
    $('#right-preprocess-latex-expression').remove();
    $('#left-preprocess-latex-expression').remove();
    $('.processing-time').remove();
    $('.display-solution').remove();
    $('#display-solutions').css({ 'border': '0px' });
    equationData = new MathUtilities.Components.EquationEngine.Models.EquationData();
    equationData.getDirectives().FDFlagMethod = "graphing";
    //equationData.constants = {'a':-8.2,'b':-7.32,'c':113.29126,'p':-3.9,'q':5.4};
    //equationData.constants = { 'a': 1, 'b': 1, 'c': 1, 'p': 1, 'q': 1 };
    //equationData.blind = true;
    //equationData.analysis.functionCode = 'return [constants["r"] * Math.cos(param-constants["b"])  + Math.sqrt(constants["a"]*constants["a"] - constants["r"]*constants["r"] * Math.sin(param - constants["b"]) * Math.sin(param -constants["b"] ))];';
    //equationData.coordinateSystem = 'polar';

    
    //object = new PlotModel();
    //object.points = [-5, 5];
    //object.color = 'green';
    equationData.setConstants({ a: 2, b: 3, '\\theta': 1,r:1 },true);
    //object.thickness = 3;
    //equationData.plotModel = object;

    equationData.setLatex($('#equation').val(),true);
    equationData.setColor('red',true);
    //equationData.constants = {'r':2,'a':50,'b':90};

    //equationData.functionVariable = 'x';
    //equationData.paramVariable = 'y';
    //equationData.type = 'plot';
    //equationData.range = {
    //    'min': { value:0, include: true },
    //    'max': { value:2*Math.PI, include: true },
    //    'variable': 'x'
    //};
    equationData.setThickness(2,true);
    var units;
    if ($('#radians').is(':checked')) {
        units = {
            angle: 'rad'
        }
    }
    else {
        units = {
            angle: 'deg'
        }
    }
    equationData.setUnits(units, true);
    plotterView.addEquation(equationData);
    printProcessingTime('#pre-process-header', equationData.getProfiles(), 0);
    printProcessingTime('#token-display-header', equationData.getProfiles(), 1);
    printProcessingTime('#production-rules-header', equationData.getProfiles(), 2);
    printProcessingTime('#header3', equationData.getProfiles(), 3);
    printProcessingTime('#header4', equationData.getProfiles(), 4);
    //for polar testing
    return;

    //    MathUtilities.Components.EquationEngine.Models.Productions.init();
    //    MathUtilities.Components.EquationEngine.Models.Parser.parseEquation(equationData);

    if (equationData.canBeSolved === true && equationData.type !== 'expression') {

        //start time for convert to solvable form stage.
//        MathUtilities.Components.EquationEngine.Models.Profile.getStartTime('convertToSolvable');

//        MathUtilities.Components.EquationEngine.Models.TreeProcedures.convertToSolvableForm(equationData);
//        //processing time for convert to solvable form stage.
//        equationData.profiles[7] = MathUtilities.Components.EquationEngine.Models.Profile.getProcessingTime('convertToSolvable');

//        printProcessingTime('#header7', equationData.profiles, 7);

//        if (equationData.type === 'plot') {
//            //var model = new PlotModel();
//            //equationData.plotModel = model;
////            equationData.color = 'red';
//            //gridGraphView.removePoint(object);
////            plot(equationData);

//            equations.push(equationData);
//        }

        if (equationData.type === 'linear' || equationData.type === 'quadratic' || equationData.type === 'expression') {
            //            var solution = MathUtilities.Components.EquationEngine.Models.TreeProcedures.solveEquation(equationData, 1);
            var solution = equationData.solution;
            if (solution[0] !== undefined) {
                var $solution1 = $('<div></div>');
                var $solutions = $('#display-solutions');
                $solutions.css({ 'border': '1px solid black' });
                var $solutionsHeader = $('<div></div>');
                $solutions.append($solutionsHeader);
                $solutionsHeader.attr('id', 'solutions-header').addClass('display-solution').append('Solutions').css({ 'font-weight': 'bold', 'padding': '5px 5px 5px 5px' });
                $solutions.append($solution1);
                $solution1.attr('id', 'solution1').addClass('display-solution').prepend(solution[0]).css({ 'width': 'auto', 'border': '1px solid', 'border-color': MathUtilities.Components.EquationEngine.Models.Parser._borderColor, 'padding': '5px 5px 5px 5px', 'margin': '5px 5px 5px 10px' });

            }
            if (solution[0] !== solution[1] && solution[1] !== undefined) {
                var $solution2 = $('<div></div>');
                var $textbox = $('#display-solutions');
                $textbox.append('<div></div>').append($solution2);
                $solution2.attr('id', 'solution2').addClass('display-solution').append(solution[1]).css({ 'width': 'auto', 'border': '1px solid', 'border-color': MathUtilities.Components.EquationEngine.Models.Parser._borderColor, 'padding': '5px 5px 5px 5px', 'margin': '5px 5px 5px 10px' });

            }

        }

        //DisplayEquation(equationData.leftRoot);
    }
    printProcessingTime('#pre-process-header', equationData.profiles, 0);
    printProcessingTime('#token-display-header', equationData.profiles, 1);
    printProcessingTime('#production-rules-header', equationData.profiles, 2);
    printProcessingTime('#header3', equationData.profiles, 3);
    printProcessingTime('#header4', equationData.profiles, 4);

}

/*
Function to show rules in a popup window
*/
function showRules() {
    var rulesWindow = window.open('', '', 'width=700,height=700');
    var textArea = $('<textarea>' + $('#rules').text() + '</textarea>');
    textArea.css({
        'width': '600px',
        'height': '600px'
    });
    $(rulesWindow.document.body).append(textArea);
    //textArea.text($('#rules').text());
    //rulesWindow.document.appendChild(textArea);
}

function updateEquation() {
    var equation = $('#equation').val();
    $('#txtBox1').html(equation.replace(/\\space|\$|\s/g, '')).mathquill();
}

function zoomGrid() {
    MathCanvas.profilingTextPosition = {
        x: 50,
        y: 50
    };
    GridGraphView.plottingLayer.removeChildren();
    gridGraphView._zoomGraph(undefined, $(this).attr('data-delta'));
    for (var equationCounter = 0; equationCounter < equations.length; equationCounter++) {
        plot(equations[equationCounter]);
    }
}


function plot_deprecated(equationData) {

    
    var nameSpace = MathUtilities.Components.EquationEngine.Models;


    var MINRANGE = (Number)(gridGraphView.markerBounds.min[equationData.paramVariable]);
    var MAXRANGE = (Number)(gridGraphView.markerBounds.max[equationData.paramVariable]);

    //if (equationData.equation === '\\tan x') {
    //    MINRANGE = 0;
    //    MAXRANGE = 4;
    //}

    //    geomFunctions.traceConsole(MINRANGE);
    //    geomFunctions.traceConsole(MAXRANGE);
    var solution;
    //    var line = new MathCanvas();
    //    line.startPlotTimer();
    var leftArray = new Array();
    var rightArray = new Array();


    var step = 8 * ((Math.abs(MINRANGE) + Math.abs(MAXRANGE)) / 10000);


    var plotData = { minX: MINRANGE, maxX: MAXRANGE,
        minY: (Number)(gridGraphView.markerBounds.min[equationData.functionVariable]),
        maxY: (Number)(gridGraphView.markerBounds.max[equationData.functionVariable]),
        step: step,
        tolerance: 0.001,
        paramVariable: equationData.paramVariable
    };

    var decimalsLength = (step.toString().split('.')[1] || []).length;
    if (nameSpace.Parser._debugFlag.plot) geomFunctions.traceConsole('Step used is :: ' + step);
    if (nameSpace.Parser._debugFlag.plot) geomFunctions.traceConsole('decimalsLength :: ' + decimalsLength);

    var equationOrder;
    if (equationData.A !== undefined) {
        equationOrder = 2;
    }
    else {
        equationOrder = 1;
    }




    //RefinePlot(equationData, MINRANGE, MAXRANGE, step, leftArray, 0, arrPositiveAsymptotes);
    function getPoint(param) {
        var solution = MathUtilities.Components.EquationEngine.Models.TreeProcedures.solveEquation(equationData, param);
        if (solution !== undefined) {
            return solution[0];
        }
        else {
            return undefined;
        }

    }

    if (equationData.freeVars[equationData.paramVariable] === 1 && equationData.freeVars[equationData.functionVariable] === 1) {
        leftArray = plottingFunctions.generateSimplePlot(getPoint, plotData);
    }
    else {
        leftArray = plottingFunctions.generatePlot(getPoint, plotData);
    }
    //debugger;

    equationData.leftArray = leftArray;


    if (equationOrder == 2) {
        function getPoint2(param) {
            var solution = MathUtilities.Components.EquationEngine.Models.TreeProcedures.solveEquation(equationData, param);
            if (solution !== undefined) {
                return solution[1];
            }
            else {
                return undefined;
            }

        }
        rightArray = plottingFunctions.generatePlot(getPoint2, plotData);
        equationData.rightArray = rightArray;
    }

    gridGraphView._addSegments(equationData);
    //return;
    //line.addPoints(leftArray.concat(rightArray));

    //   var model=new 

    equationData.points = leftArray;
    //equationData.plotModel.points2 = rightArray;

    equationData.thickness = 2;
    //    model.set({ points: leftArray.concat(rightArray), color: 'red', thickness: 3 })
    //    gridGraphView.addPoints(leftArray.concat(rightArray));



    //gridGraphView._addGraph(equationData, equationData.functionVariable, equationOrder);

}


var plottingFunctions = {
    generateSimplePlot: function generateSimplePlot(engine, plotData) {
        var plot = plottingFunctions.getPlotObject(plotData);
        plottingFunctions.addPoint(plot, plotData.minX, engine(plotData.minX));
        plottingFunctions.addPoint(plot, plotData.maxX, engine(plotData.maxX));
        plottingFunctions.finishSegment(plot);
        return plot.lines;
    },


    addPoint: function addPoint(plot, x, y) {
        var point = [x, y];
        var currentPivot = plot.basePoint;

        if (!plot.temporaryLines) {
            plot.temporaryLines = [point[0], point[1]];
            return;
        }

        if (plot.tolerance < 0) {
            plot.temporaryLines.push(point[0], point[1]);
            return;
        }

        if (!currentPivot) {
            plot.basePoint = point;
            plot.unsettledPoint = point;
            return;
        }

        var lastPoint = [plot.temporaryLines[plot.temporaryLines.length - 2], plot.temporaryLines[plot.temporaryLines.length - 1]];

        if (!this.changePivot(lastPoint, currentPivot, point, plot.tolerance, plot.tolerance)) {
            this.removeUnsettledPoints(plot);
            plot.basePoint = point;
        }

        plot.unsettledPoint = point;
    },

    removeUnsettledPoints: function removeUnsettledPoints(plot) {
        if (plot.unsettledPoint) {
            plot.temporaryLines.push(plot.unsettledPoint[0], plot.unsettledPoint[1]);
            plot.basePoint = null;
            plot.unsettledPoint = null;

        }
    },

    finishSegment: function finishSegment(plot) {
        plottingFunctions.removeUnsettledPoints(plot);
        if (plot.temporaryLines) {
            plottingFunctions.fitPointsInsideDomain(plot, plot.temporaryLines);
            plot.temporaryLines = plottingFunctions.translateSegment(plot, plot.temporaryLines);
            if (plot.temporaryLines.length >= 2) plot.lines.push(plot.temporaryLines);
            plot.temporaryLines = null;
        }

    },



    translateSegment: function translateSegment(plot, segment) {

        var point;
        var newsegment = [];

        for (var i = 0; i < segment.length - 1; i += 2) {
            if (plot.paramVariable === 'x') {
                point = [segment[i], segment[i + 1]];
            }
            else {
                point = [segment[i + 1], segment[i]];
            }

            point = gridGraphView._getCanvasPointCoordinates(point);

            //TODO: use projection and not constant values
            /*if (point[0] > 1000) {
            point[0] = 1000;
            }
            else if (point[0] < -100) {
            point[0] = -100;
            }
            if (point[1] > 1000) {
            point[1] = 1000;
            }
            else if (point[1] < -100) {
            point[1] = -100;
            }*/
            newsegment.push(point);
        }
        return newsegment;
    },

    projectPointOnDomain: function projectPointOnDomain(plot, lastPointX, lastPointY, x, y) {
        var horizLineX1, horizLineY1, vertLineX1, vertLineY1;
        var horizLineX2, horizLineY2, vertLineX2, vertLineY2;
        //geomFunctions.traceConsole('projecting point on domain ' + lastPointX, lastPointY + ' >> ' + x, y);
        var calcHorizontal = true, calcVertical = true;

        if (x < plot.domain.minX) {
            vertLineX1 = plot.domain.minX;
            vertLineY1 = plot.domain.minY;

            vertLineX2 = plot.domain.minX;
            vertLineY2 = plot.domain.maxY;
        }
        else if (x > plot.domain.maxX) {
            vertLineX1 = plot.domain.maxX;
            vertLineY1 = plot.domain.minY;

            vertLineX2 = plot.domain.maxX;
            vertLineY2 = plot.domain.maxY;
        }
        else {
            calcHorizontal = false;
        }

        if (calcHorizontal || calcVertical) {
            //debugger;
        }

        if (y < plot.domain.minY) {
            horizLineX1 = plot.domain.minX;
            horizLineY1 = plot.domain.minY;

            horizLineX2 = plot.domain.maxX;
            horizLineY2 = plot.domain.minY;
        }
        else if (y > plot.domain.maxY) {
            horizLineX1 = plot.domain.minX;
            horizLineY1 = plot.domain.maxY;

            horizLineX2 = plot.domain.maxX;
            horizLineY2 = plot.domain.maxY;
        }
        else {
            calcVertical = false;
        }

        var intersect1, intersect2, h1, h2, d1, d2;
        if (calcVertical) {
            intersect1 = geomFunctions.intersectionOfLines(horizLineX1, horizLineY1, horizLineX2, horizLineY2, lastPointX, lastPointY, x, y);
            //h1 = geomFunctions.getSegmentParam(horizLineX1, horizLineY1, horizLineX2, horizLineY2, intersect1[0], intersect1[1]);
            if (intersect1 === undefined) {
                //debugger;
            }
            d1 = geomFunctions.distance2(lastPointX, lastPointY, intersect1[0], intersect1[1]);
        }
        if (calcHorizontal) {
            intersect2 = geomFunctions.intersectionOfLines(vertLineX1, vertLineY1, vertLineX2, vertLineY2, lastPointX, lastPointY, x, y);
            if (intersect2 === undefined) {
                //debugger;
            }
            //h2 = geomFunctions.getSegmentParam(vertLineX1, vertLineY1, vertLineX2, vertLineY2, intersect2[0], intersect2[1]);
            d2 = geomFunctions.distance2(lastPointX, lastPointY, intersect2[0], intersec2[1]);
        }

        if (d1 && d2) {
            if (d1 > d2) {
                return intersect1;
            }
            else {
                return intersect2;

            }
        }
        else {
            if (d1) {
                return intersect1;
            }
            if (d2) {
                return intersect2;
            }
        }


    },

    fitPointsInsideDomain: function fitPointsInsideDomain(plot, segment) {
        var i;
        var lastX, lastY;
        var intersect;

        var lastIntersect;
        var beginFrom;
        var lastDomain, currentDomain;
        var adjustNewPoint, adjustOldPoint;
        var newPointIntersect, lastPointIntersect;
        var archiveNewPointIntersect;

        for (i = 0; i < segment.length - 1; i += 2) {
            if (segment[i] === lastX && segment[i + 1] === lastY) {
                continue;
            }
            currentDomain = this.getDomainForPoint(plot, segment[i], segment[i + 1]);

            if (lastX === undefined) {

                lastX = segment[i];
                lastY = segment[i + 1];


                if (currentDomain !== 0) {
                    beginFrom = 0;
                }
                lastDomain = currentDomain;
                continue;
            }


            adjustNewPoint = false;
            adjustOldPoint = false;

            if (currentDomain !== lastDomain) {
                if (currentDomain !== 0) {
                    adjustNewPoint = true;

                    if (lastDomain !== 0) {
                        adjustOldPoint = true;
                    }
                }
                else {
                    if (lastDomain !== 0) {
                        adjustOldPoint = true;
                    }

                }
            }


            //geomFunctions.traceConsole('last domain ' + lastDomain + ' current domain ' + currentDomain);
            //geomFunctions.traceConsole('adjust old ' + adjustOldPoint + ' adjust new ' + adjustNewPoint);


            if (adjustOldPoint) {
                //geomFunctions.traceConsole('adjusting old point');
                lastPointIntersect = this.projectPointOnDomain(plot, segment[i], segment[i + 1], lastX, lastY);

                //lastX = segment[i];
                //lastY = segment[i + 1];


                for (var j = beginFrom; j < i; j += 2) {
                    segment[j] = lastPointIntersect[0];
                    segment[j + 1] = lastPointIntersect[1];
                }
                lastX = lastPointIntersect[0];
                lastY = lastPointIntersect[1];
                //geomFunctions.traceConsole('last positions ' + lastX, lastY);
                currentDomain = 0;

                beginFrom = undefined;
                archiveNewPointIntersect = undefined;
            }

            if (adjustNewPoint) {
                if (archiveNewPointIntersect === undefined) {
                    //geomFunctions.traceConsole('adjusting new point');
                    newPointIntersect = this.projectPointOnDomain(plot, lastX, lastY, segment[i], segment[i + 1]);
                    archiveNewPointIntersect = newPointIntersect;
                }
                else {
                    newPointIntersect = archiveNewPointIntersect;
                }

                segment[i] = archiveNewPointIntersect[0];
                segment[i + 1] = archiveNewPointIntersect[1];
                if (adjustNewPoint && adjustOldPoint) {
                    lastDomain = 0;
                    //geomFunctions.traceConsole('Both points adjusted last: ' + lastX, lastY + ' lastDomain:' + lastDomain);
                }

                //geomFunctions.traceConsole('----------------------------------------');
                continue;
            }


            lastDomain = currentDomain;
            if (!adjustNewPoint && !adjustOldPoint) {
                lastX = segment[i];
                lastY = segment[i + 1];
            }

            //geomFunctions.traceConsole('----------------------------------------');
            continue;

            //------------------

        }
    },

    changePivot: function changePivot(lastPoint, pivot, point, tolX, tolY) {
        //if (a && a.map) {
        //    lastPoint = a.map(lastPoint);
        //    pivot = a.map(pivot);
        //    point = a.map(point);
        //}

        var p = geomFunctions.getSegmentParam(point[0], point[1], lastPoint[0], lastPoint[1], pivot[0], pivot[1]);


        if (p < 1) {
            return false;
        }

        var interpolatedPoint = [lastPoint[0] + p * (pivot[0] - lastPoint[0]), lastPoint[1] + p * (pivot[1] - lastPoint[1])];


        return (Math.abs(point[0] - interpolatedPoint[0]) <= tolX && Math.abs(point[1] - interpolatedPoint[1]) <= tolY);
    },

    isPointOutSideDomain: function isPointOutSideDomain(plot, x1, y1) {

        /*if (x1 < plot.domain.minX || x1 > plot.domain.maxX) {
        return true;
        }

        if (y1 < plot.domain.minY || y1 > plot.domain.maxY) {
        return true;
        }
        return false;*/
        return this.getDomainForPoint(plot, x, y) === 0;
    },

    getDomainForPoint: function getDomainForPoint(plot, x1, y1) {
        //0 means inside 1 means below 2 means above
        //
        var x = 0, y = 0;
        if (x1 < plot.domain.minX) {
            x = 1;
        }
        else if (x1 > plot.domain.maxX) {
            x = 2;
        }

        if (y1 < plot.domain.minY) {
            y = 1;
        }
        else if (y1 > plot.domain.maxY) {
            y = 2;
        }
        return y * 10 + x;
    },


    getPlotObject: function getPlotObject(a) {
        return {
            lines: [],
            segment: null,
            tolerance: a.tolerance,
            domain: a,
            basePoint: null,
            unsettledPoint: null,
            paramVariable: a.paramVariable
        }
    },

    generatePlot: function generatePlot(engine, graphDomain) {
        var refine = function (pt1, pt2) {
            if (!isFinite(tolerance) || tolerance <= 0)
                return;
            var breakingPoint, xmean;
            xmean = geomFunctions.mean(pt1[0], pt2[0]);
            breakingPoint = plottingFunctions.detectJump(engine, tolerance, pt1[0], pt1[1], xmean, engine(xmean), pt2[0], pt2[1]);
            if (breakingPoint) {
                plottingFunctions.addPoint(plot, breakingPoint[0][0], breakingPoint[0][1]);
                plottingFunctions.finishSegment(plot);
                plottingFunctions.addPoint(plot, breakingPoint[1][0], breakingPoint[1][1]);
            }
        };

        var plot = plottingFunctions.getPlotObject(graphDomain);
        var refinedPoint;
        var x = graphDomain.minX;
        var y = engine(x);
        var currentPoint = [x, y];
        var tolerance;


        if (graphDomain) {
            tolerance = graphDomain.tolerance;
        }
        if (isFinite(y)) {
            plottingFunctions.addPoint(plot, x, y);
        }
        x += graphDomain.step;


        while (x <= graphDomain.maxX) {
            y = engine(x);
            if (isFinite(y) && isFinite(currentPoint[1])) {
                refine(currentPoint, [x, y]);
                plottingFunctions.addPoint(plot, x, y);
            }
            else if (isFinite(y) && !isFinite(currentPoint[1])) {
                refinedPoint = plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                if (refinedPoint[0] !== x) plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                refine(refinedPoint, [x, y]);
                plottingFunctions.addPoint(plot, x, y);
            }
            else if (!isFinite(y) && isFinite(currentPoint[1])) {
                refinedPoint = plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                refine(currentPoint, refinedPoint);
                if (refinedPoint[0] !== currentPoint[0]) plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                plottingFunctions.finishSegment(plot);
            }


            currentPoint = [x, y];
            x += graphDomain.step;
        }
        plottingFunctions.finishSegment(plot);
        return plot.lines;
    },

    detectJump: function detectJump(engine, tolerance, x1, y1, xmean, ymean, x2, y2) {

        var pole1, pole2, flag1, flag2, diff1, diff2, jumpFrom, jumpTo;

        if (!isFinite(y1) || !isFinite(ymean) || !isFinite(y2)) {
            geomFunctions.traceConsole("invalid y vals for detectJump ", y1, ymean, y2);
            return
        }

        if (x1 > xmean || xmean > x2) {
            geomFunctions.traceConsole("Invalid x vals for detectJump ", x1, xmean, x2);
            return
        }

        //geomFunctions.traceConsole('detecting jump between ' + x1, y1 + ">> " + x2, y2);

        //tolerance = 0;

        while (1) {

            pole1 = this.getInterpolationParam(x1, xmean);
            flag1 = engine(pole1);
            diff1 = Math.abs(flag1 - geomFunctions.mean(y1, ymean));

            pole2 = this.getInterpolationParam(xmean, x2);
            flag2 = engine(pole2);
            diff2 = Math.abs(flag2 - geomFunctions.mean(ymean, y2));


            if (!tolerance) {
                tolerance = 0;
            }


            //geomFunctions.traceConsole('->[' + x1.toFixed(4), y1.toFixed(4) + ']  ~[' + m.toFixed(4), n.toFixed(4) + ']  mean[' + xmean.toFixed(4), ymean.toFixed(4) + '] ~2[' + o.toFixed(4), p.toFixed(4) + '] [' + x2.toFixed(4), y2.toFixed(4) + ']<-');


            //since the curve is very close to the mean values, we dont need to refine further
            if (diff1 <= tolerance && diff2 <= tolerance) {
                //geomFunctions.traceConsole('curve going as expected');
                return null;
            }

            if (!isFinite(flag1)) {
                //check $\frac{1}{x^2}$ with upper values> ~20
                jumpFrom = plottingFunctions.limitedRefine(x1, y1, pole1, flag1, engine);
                jumpTo = plottingFunctions.limitedRefine(pole1, flag1, x2, y2, engine);
                return [jumpFrom, jumpTo];
            }
            if (!isFinite(flag2)) {
                jumpFrom = plottingFunctions.limitedRefine(x1, y1, pole2, flag2, engine);
                jumpTo = plottingFunctions.limitedRefine(pole2, flag2, x2, y2, engine);
                return [jumpFrom, jumpTo];
            }


            if ((pole1 === x1 || pole1 === xmean) && (pole2 === xmean || pole2 === x2)) {
                if (Math.abs(ymean - y1) > Math.abs(y2 - ymean)) {
                    jumpFrom = [x1, y1];
                    jumpTo = [xmean, ymean];
                    //geomFunctions.traceConsole('Jump point found ' + jumpFrom + " to " + jumpTo);
                }
                else {
                    jumpFrom = [xmean, ymean];
                    jumpTo = [x2, y2];
                    //geomFunctions.traceConsole('Jump point found ' + jumpFrom + " to " + jumpTo);
                }
                return [jumpFrom, jumpTo];
            }

            if (pole1 === x1 || pole1 === xmean) {
                return selectJumpPoint(x1, y1, xmean, ymean, pole2, flag2, x2, y2);
            }
            if (pole2 === xmean || pole2 === x2) {
                return selectJumpPoint(x1, y1, pole1, flag1, xmean, ymean, x2, y2);
            }

            if (diff1 > diff2) {
                x2 = xmean;
                y2 = ymean;
                xmean = pole1;
                ymean = flag1;
            }
            else {
                x1 = xmean;
                y1 = ymean;
                xmean = pole2;
                ymean = flag2;
            }
        }
    },


    selectJumpPoint: function selectJumpPoint(x1, y1, x2, y2, x3, y3, x4, y4) {
        var diff1 = Math.abs(y2 - y1);
        var diff2 = Math.abs(y3 - y2);
        var diff3 = Math.abs(y4 - y3);

        if (diff1 > diff2 && diff1 > diff3) {
            return [[x1, y1], [x2, y2]];
        }
        else if (diff3 > diff2 && diff3 > diff1) {
            return [[x3, y3], [x4, y4]];
        }
        else {
            return [[x2, y2], [x3, y3]];
        }
    },




    getInterpolationParam: function getInterpolationParam(x1, x2) {
        var firstPositive, secondPositive, g, h, i;

        if (x1 > x2) {
            //swap x1 x2
            x1 = x1 + x2 - (x2 = x1);
        }
        firstPositive = x1 > 0;
        secondPositive = x2 > 0;


        if (Math.abs(x1) > .01 || Math.abs(x2) > .01) {
            return geomFunctions.mean(x1, x2);
        }
        else {
            if (x1 === 0) {
                //$\left(\cos x\right)\cdot \log x$
                return x2 * Math.abs(x2) * Math.abs(x2);
            }
            else if (x2 === 0) {
                return x1 * Math.abs(x1) * Math.abs(x1);
            }
            else {
                if (firstPositive !== secondPositive) {
                    return 0;
                }
                if (firstPositive) {
                    i = Math.sqrt(x1 * x2);
                }
                else {
                    i = -Math.sqrt(x1 * x2);
                }
                if (i >= x1 && x2 >= i) {
                    return i;
                }
                else {
                    return geomFunctions.mean(x1, x2);
                }

            }
        }
    },



    limitedRefine: function limitedRefine(x1, y1, x2, y2, engine) {
        var pole, flag;
        geomFunctions.traceConsole('limited Refine from ' + x1, y1 + ' to ' + x2, y2);
        if (isFinite(y1) === isFinite(y2)) {
            //geomFunctions.traceConsole("limitedRefine: invalid params ", [y1, y2]);
            return;
        }
        while (1) {
            pole = this.getInterpolationParam(x1, x2);
            flag = engine(pole);
            if (pole === x1 || pole === x2) {
                if (isFinite(y1)) {
                    return [x1, y1];
                }
                else {
                    return [x2, y2];
                }
            }
            if (isFinite(flag) !== isFinite(y1)) {
                x2 = pole;
                y2 = flag;
            }
            else {
                x1 = pole;
                y1 = flag;
            }
        }
    }

};




function generatePoint(plotPoint, functionVariable, solutionIndex) {

    var arr = [];
    if (functionVariable !== 'y') {
        arr.push(plotPoint[0 + solutionIndex]);
        arr.push(plotPoint[0]);
    }
    else {
        arr.push(plotPoint[0]);
        arr.push(plotPoint[0 + solutionIndex]);
    }
    return arr;
}


