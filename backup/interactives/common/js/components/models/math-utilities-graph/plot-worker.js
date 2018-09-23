self.addEventListener('message', function (e) {
    var data = e.data;
    var functionCode = data.code;
    var plot = data.plot;
    var constants = data.constants;
    var id = data.id;
    var plotSessionCount = data.plotSession;
    var autonomous = data.autonomous;
    var engine, lines, lines2;

    if (autonomous) {
        engine = new Function('constants,plot', functionCode);
        lines = engine(constants);

    }
    else {
        engine = new Function('param,constants', functionCode);

        var engine1 = function eng1(param) { var soln = engine(param, constants); return soln[0]; }
        var engine2 = function eng2(param) { var soln = engine(param, constants); return soln[1]; }


        lines = plottingFunctions.generatePlot(engine1, plot);
        
        if (data.order === 2) {
            lines2 = plottingFunctions.generatePlot(engine2, plot);
        }
    }

    
    self.postMessage({ 'lines': lines, 'lines2': lines2, 'id': id, 'plot': plot, 'plotSession': plotSessionCount });

    
}, false);




var plottingFunctions = {
    _graphView: null,

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

           

        if (!currentPivot) {
            plot.basePoint = point;
            plot.unsettledPoint = point;
            return;
        }

        var lastPoint = [plot.temporaryLines[plot.temporaryLines.length - 2], plot.temporaryLines[plot.temporaryLines.length - 1]];

        if (!this.changePivot(lastPoint, currentPivot, point, plot.tolerance)) {
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
            lines = plottingFunctions.fitPointsInsideDomain(plot, plot.temporaryLines);

            var line;
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].length < 2) {
                    continue;
                }
                line = lines[i];
                //line = plottingFunctions.translateSegment(plot, lines[i]);
                plot.lines.push(line);
            }
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
            point = this._graphView._getCanvasPointCoordinates(point);

             
            newsegment.push(point);
        }
        return newsegment;
    },

    projectPointOnDomain: function projectPointOnDomain(plot, lastPointX, lastPointY, x, y) {

        var horizLineX1, horizLineY1, vertLineX1, vertLineY1;
        var horizLineX2, horizLineY2, vertLineX2, vertLineY2;

        //console.log('projecting point on domain ' + lastPointX, lastPointY + ' >> ' + x, y);
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
            if (intersect1 !== undefined) {
                d1 = geomFunctions.distance2(lastPointX, lastPointY, intersect1[0], intersect1[1]);
            }
                
        }
        if (calcHorizontal) {
            intersect2 = geomFunctions.intersectionOfLines(vertLineX1, vertLineY1, vertLineX2, vertLineY2, lastPointX, lastPointY, x, y);
            if (intersect2 !== undefined) {
                d2 = geomFunctions.distance2(lastPointX, lastPointY, intersect2[0], intersect2[1]);
            }
            //h2 = geomFunctions.getSegmentParam(vertLineX1, vertLineY1, vertLineX2, vertLineY2, intersect2[0], intersect2[1]);
                
        }
        if (!d1 && !d2) {
            return;
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
        if (segment === undefined) {
            return;
        }
        if (segment.length < 2) {
            return;
        }
        var i;
        var lastX, lastY;
        var intersect;

        var lastIntersect;
        var beginFrom;
        var lastDomain, currentDomain;
        var adjustNewPoint, adjustOldPoint;
        var newPointIntersect, lastPointIntersect;
        var archiveNewPointIntersect;


        var breakSegment;
        var currentSegment = [];
        var dividedSegments = [currentSegment];

        var domainHistory = [];


        for (i = 0; i < segment.length - 1; i += 2) {
            if (segment[i] === lastX && segment[i + 1] === lastY) {
                continue;
            }
            currentDomain = this.getDomainForPoint(plot, segment[i], segment[i + 1]);

            if (lastX === undefined) {

                lastX = segment[i];
                lastY = segment[i + 1];




                if (currentDomain === 0) {
                    currentSegment.push(segment[i]);
                    currentSegment.push(segment[i + 1]);
                }
                lastDomain = currentDomain;
                domainHistory.push(currentDomain);
                continue;
            }



            if (currentDomain !== lastDomain) {

                if (currentDomain === 0) {
                    if (domainHistory.indexOf(0) > -1) {

                        while (domainHistory.length > 0) { domainHistory.pop(); }
                        currentSegment = [];
                        dividedSegments.push(currentSegment);

                    }
                }

                domainHistory.push(currentDomain);
            }


            //console.log('last domain ' + lastDomain + ' current domain ' + currentDomain);
            //console.log('adjust old ' + adjustOldPoint + ' adjust new ' + adjustNewPoint);

            if (currentDomain === 0) {
                if (lastDomain !== 0) {
                    intersect = this.projectPointOnDomain(plot, segment[i], segment[i + 1], lastX, lastY);
                    if (intersect === undefined) {
                        //console.log("Cant project point ", lastX, lastY + " onto domain...skipping");
                        continue;
                    }
                    currentSegment.push(intersect[0]);
                    currentSegment.push(intersect[1]);
                }

                currentSegment.push(segment[i]);
                currentSegment.push(segment[i + 1]);
            }
            else {
                if (lastDomain === 0) {
                    intersect = this.projectPointOnDomain(plot, lastX, lastY, segment[i], segment[i + 1]);
                    if (intersect === undefined) {
                        //console.log("Cant project point ", segment[i], segment[i + 1] + " onto domain...skipping");
                        continue;
                        //debugger;
                    }

                    currentSegment.push(intersect[0]);
                    currentSegment.push(intersect[1]);
                }
                else {
                    if (currentDomain !== lastDomain) {
                        intersect = this.projectPointOnDomain(plot, segment[i], segment[i + 1], lastX, lastY);
                        if (intersect === undefined) {
                            //console.log("Cant project point ", lastX, lastY + " onto domain...skipping");
                            continue;
                        }
                        currentSegment.push(intersect[0]);
                        currentSegment.push(intersect[1]);

                        intersect = this.projectPointOnDomain(plot, lastX, lastY, segment[i], segment[i + 1]);
                        if (intersect === undefined) {
                            //console.log("Cant project point ", segment[i], segment[i + 1] + " onto domain...skipping");
                            continue;
                        }
                        currentSegment.push(intersect[0]);
                        currentSegment.push(intersect[1]);


                    }
                }
            }



            lastDomain = currentDomain;
            lastX = segment[i];
            lastY = segment[i + 1];



        }

        return dividedSegments;

    },

    changePivot: function changePivot(lastPoint, pivot, point, tolerance) {
           
        var p = geomFunctions.getSegmentParam(point[0], point[1], lastPoint[0], lastPoint[1], pivot[0], pivot[1]);


        if (p < 1) {
            return false;
        }

        var interpolatedPoint = [lastPoint[0] + p * (pivot[0] - lastPoint[0]), lastPoint[1] + p * (pivot[1] - lastPoint[1])];


        return (Math.abs(point[0] - interpolatedPoint[0]) <= tolerance && Math.abs(point[1] - interpolatedPoint[1]) <= tolerance);
    },

    isPointOutSideDomain: function isPointOutSideDomain(plot, x1, y1) {
        return this.getDomainForPoint(plot, x, y) === 0;
    },

    getDomainForPoint: function getDomainForPoint(plot, x1, y1) {
        //0 means inside 1 means below 2 means above
        //
        var x = 0, y = 0;
        if (x1 < plot.domain.minX - 10) {
            x = 1;
        }
        else if (x1 > plot.domain.maxX + 10) {
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


    getPlotObject: function getPlotObject(domain) {
        return {
            lines: [],
            segment: null,
            tolerance: domain.tolerance,
            domain: domain,
            basePoint: null,
            unsettledPoint: null,
            paramVariable: domain.paramVariable
        }
    },

    refine: function (pt1, pt2, engine, plot) {
        var breakingPoint, xmean;
        xmean = geomFunctions.mean(pt1[0], pt2[0]);
        breakingPoint = plottingFunctions.detectJump(engine, plot.domain.tolerance, pt1[0], pt1[1], xmean, engine(xmean), pt2[0], pt2[1]);
        if (breakingPoint) {
            plottingFunctions.addPoint(plot, breakingPoint[0][0], breakingPoint[0][1]);
            plottingFunctions.finishSegment(plot);
            plottingFunctions.addPoint(plot, breakingPoint[1][0], breakingPoint[1][1]);
        }
    },

    generatePlot: function generatePlot(engine, plotData) {

        
            
        //TODO domain in plot is redundant...merge them in plot?
        var plot = plottingFunctions.getPlotObject(plotData);

        var refinedPoint;
        var x = plotData.minX;
        var y = engine(x);
        var currentPoint = [x, y];


        if (isFinite(y)) {
            plottingFunctions.addPoint(plot, x, y);
        }
        x += plotData.step;


        while (x <= plotData.maxX) {
            y = engine(x);
            if (isFinite(y) && isFinite(currentPoint[1])) {
                plottingFunctions.refine(currentPoint, [x, y], engine, plot);
                plottingFunctions.addPoint(plot, x, y);
            }
            else if (isFinite(y) && !isFinite(currentPoint[1])) {
                refinedPoint = plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                if (refinedPoint[0] !== x) plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                plottingFunctions.refine(refinedPoint, [x, y], engine, plot);
                plottingFunctions.addPoint(plot, x, y);
            }
            else if (!isFinite(y) && isFinite(currentPoint[1])) {
                refinedPoint = plottingFunctions.limitedRefine(currentPoint[0], currentPoint[1], x, y, engine);
                plottingFunctions.refine(currentPoint, refinedPoint, engine, plot);
                if (refinedPoint[0] !== currentPoint[0]) plottingFunctions.addPoint(plot, refinedPoint[0], refinedPoint[1]);
                plottingFunctions.finishSegment(plot);
            }
            currentPoint = [x, y];
            x += plotData.step;
        }
        plottingFunctions.finishSegment(plot);
        return plot.lines;
    },

    detectJump: function detectJump(engine, tolerance, x1, y1, xmean, ymean, x2, y2) {

        var pole1, pole2, flag1, flag2, diff1, diff2, jumpFrom, jumpTo;

        if (!isFinite(y1) || !isFinite(ymean) || !isFinite(y2)) {
            return
        }

        if (x1 > xmean || xmean > x2) {
            return
        }

        //console.log('detecting jump between ' + x1, y1 + ">> " + x2, y2);

        //tolerance = 0;

        while (1) {

            pole1 = this.getInterpolationParam(x1, xmean);
            flag1 = engine(pole1);
            diff1 = Math.abs(flag1 - geomFunctions.mean(y1, ymean));

            pole2 = this.getInterpolationParam(xmean, x2);
            flag2 = engine(pole2);
            diff2 = Math.abs(flag2 - geomFunctions.mean(ymean, y2));



            //console.log('->[' + x1.toFixed(4), y1.toFixed(4) + ']  ~[' + m.toFixed(4), n.toFixed(4) + ']  mean[' + xmean.toFixed(4), ymean.toFixed(4) + '] ~2[' + o.toFixed(4), p.toFixed(4) + '] [' + x2.toFixed(4), y2.toFixed(4) + ']<-');


            //since the curve is very close to the mean values, we dont need to refine further
            if (diff1 <= tolerance && diff2 <= tolerance) {
                //console.log('curve going as expected');
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
                    //console.log('Jump point found ' + jumpFrom + " to " + jumpTo);
                }
                else {
                    jumpFrom = [xmean, ymean];
                    jumpTo = [x2, y2];
                    //console.log('Jump point found ' + jumpFrom + " to " + jumpTo);
                }
                return [jumpFrom, jumpTo];
            }

            if (pole1 === x1 || pole1 === xmean) {
                return plottingFunctions.selectJumpPoint(x1, y1, xmean, ymean, pole2, flag2, x2, y2);
            }
            if (pole2 === xmean || pole2 === x2) {
                return plottingFunctions.selectJumpPoint(x1, y1, pole1, flag1, xmean, ymean, x2, y2);
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
        var firstPositive, secondPositive, root;

        if (x1 > x2) {
            //swap x1 x2
            x1 = x1 + x2 - (x2 = x1);
        }

        if (Math.abs(x1) > .01 || Math.abs(x2) > .01) {
            return geomFunctions.mean(x1, x2);
        }
        else {
            if (x1 === 0) {
                //$\left(\cos x\right)\cdot \log x$
                return x2 * Math.abs(x2);
            }
            else if (x2 === 0) {
                return x1 * Math.abs(x1);
            }
            else {
                if (x1 > 0 !== x2 > 0) {
                    //if one is positive and one is negative then 0
                    return 0;
                }
                return geomFunctions.mean(x1, x2);

                if (x1 > 0) {
                    //both and +ve and we take a +ve root as interpolation param
                    root = Math.sqrt(x1 * x2);
                }
                else {
                    //both and -ve and we take a -ve root as interpolation param
                    root = -Math.sqrt(x1 * x2);
                }

                //x2 >= root >= x1
                if (root >= x1 && x2 >= root) {
                    return root;
                }
                else {
                    return geomFunctions.mean(x1, x2);
                }

            }
        }
    },
    setGraphView: function setGraphView(view) {
        this._graphView = view;
    },

    limitedRefine: function limitedRefine(x1, y1, x2, y2, engine) {
        var pole, flag;
        //            console.log('limited Refine from ' + x1, y1 + ' to ' + x2, y2);

        if (isFinite(y1) === isFinite(y2)) {
            //console.log('one of of the params has to be non-finite');
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
var geomFunctions = {
    distance: function distance(point1, point2) {
        return Math.sqrt((point2.y - point1.y) * (point2.y - point1.y) + (point2.x - point1.x) * (point2.x - point1.x));

    },
    distance2: function distance2(x1, y1, x2, y2) {
        return Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1));

    },

    hypotenuse: function (n1, n2) {
        if (n1 === 0 && n2 === 0) {
            return 0;
        }
        else {
            if (Math.abs(n1) > Math.abs(n2)) {
                return Math.abs(n1) * Math.sqrt((n2 / n1) * (n2 / n1) + 1);
            }
            else {
                return Math.abs(n2) * Math.sqrt((n1 / n2) * (n1 / n2) + 1);
            }
        }
    },

    intersectionOfLines: function intersectionOfLines(x1, y1, x2, y2, x3, y3, x4, y4) {
        var det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (det === 0) {
            return;
        }

        var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / det;
        var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / det;
        return [x, y];
    },

    mean: function (n1, n2) {

        if (n1 > 0 == n2 > 0) {
            return n1 + (n2 - n1) / 2;
        }
        else {
            return (n1 + n2) / 2;
        }

    },

    dotProduct: function (x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
    },

    getSegmentParam: function (x1, y1, x2, y2, x3, y3) {
        var hypot = this.hypotenuse(x3 - x2, y3 - y2);
        if (hypot === 0) {
            return 0;
        }
        var param = this.dotProduct((x1 - x2) / hypot, (y1 - y2) / hypot, (x3 - x2) / hypot, (y3 - y2) / hypot);
        return param;
    },


    midPoint: function midpoint(point1, point2) {
        return [(point2[1] + point1[1]) / 2, (point2[0] + point1[0]) / 2];
    },


    closestPointOnSegment: function (pointX, pointY, x1, y1, x2, y2) {
        var param = this.getSegmentParam(pointX, pointY, x1, y1, x2, y2);

        if (param <= 0) {
            return [x1, y1];
        }
        else if (param >= 1) {
            return [x2, y2];
        }
        else {
            return [x1 + param * (x2 - x1), y1 + param * (y2 - y1)];
        }

    },

    distanceToSegment: function (x1, y1, x2, y2, x3, y3) {
        var point = this.closestPointOnSegment(x1, y1, x2, y2, x3, y3);
        return this.hypotenuse(x1 - point[0], y1 - point[1]);
    },



};