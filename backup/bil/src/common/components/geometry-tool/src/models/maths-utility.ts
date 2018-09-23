import { Point } from "paper";
import { PlotterView } from "../views/plotter-view";
import { ArcParameters, DrawingObject, LabelPoints } from "./classes";
import { GridGraph } from "./grid-graph-model";

const canvasDistance = 20,
    canvasDistanceForPoint = 15,
    rotateAngle = 90;

// tslint:disable-next-line:no-unnecessary-class
export class Utility {

    public static THRESHOLD_VALUE = 1e-8;

    public static distanceWithPaper(point1: Point, point2: Point): number {
        return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));
    }

    public static distance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
    }

    public static roundIfTooSmall(value: number): number {
        const rounded = Math.round(value);
        return Utility.compareWithThreshold(rounded, value) ? rounded : value;
    }

    public static compareWithThreshold(num1: number, num2: number): boolean {
        return Math.abs(num1 - num2) <= Utility.THRESHOLD_VALUE;
    }

    public static hypotenuse(base: number, height: number): number {
        if (base === 0 && height === 0) {
            return 0;
        }
        if (Math.abs(base) > Math.abs(height)) {
            return Math.abs(base) * Math.sqrt(Math.pow(height / base, 2) + 1);
        }
        return Math.abs(height) * Math.sqrt(Math.pow(base / height, 2) + 1);
    }

    public static areaOfEllipse(major: number, minor: number): number {
        return Math.PI * major * minor;
    }

    public static pointLineDistance(constants: any, point: Point): number {
        return Math.abs((constants.a * point.x + constants.b * point.y + constants.c) /
            Math.sqrt(Math.pow(constants.a, 2) + Math.pow(constants.b, 2)));
    }

    public static intersectionOfLines(point1: Point, point2: Point, point3: Point, point4: Point)
        : Point {
        const det = (point1.x - point2.x) * (point3.y - point4.y) - (point1.y - point2.y) * (point3.x - point4.x),
            intersection = new Point(null, null),
            num1 = (point1.x * point2.y - point1.y * point2.x),
            num2 = (point3.x * point4.y - point3.y * point4.x);
        if (det === 0) {
            return void 0;
        }
        intersection.x = (num1 * (point3.x - point4.x) - (point1.x - point2.x) * num2) / det;
        intersection.y = (num1 * (point3.y - point4.y) - (point1.y - point2.y) * num2) / det;
        return intersection;
    }

    public static intersectionOfCircles(center1: Point, center2: Point, r1: number, r2: number): any {

        let distCenter1ToIntLine, distCenter2ToIntLine, point1, point2, resDistance, point: Point;
        const intersectionLine: any = {},
            lineJoiningCenters: any = {},
            r1Square = Math.pow(r1, 2),
            r2Square = Math.pow(r2, 2),
            r1SquareMinusr2Square = r1Square - r2Square,
            distInCenters = Utility.distance(center1.x, center1.y, center2.x, center2.y),
            distInCentersSquare = Math.pow(distInCenters, 2),
            distInCentersDouble = distInCenters * 2;
        if (distInCenters > r1 + r2 || distInCenters < Math.abs(r1 - r2)) {
            return [];
        }
        distCenter1ToIntLine = (r1SquareMinusr2Square + distInCentersSquare) / distInCentersDouble;
        distCenter2ToIntLine = (-r1SquareMinusr2Square + distInCentersSquare) / distInCentersDouble;
        // perpendicular distance from intersection Point to point on line joining centers of circles
        resDistance = Math.sqrt(r1Square - Math.pow(distCenter1ToIntLine, 2));

        lineJoiningCenters.a = center1.y - center2.y;
        lineJoiningCenters.b = -(center1.x - center2.x);
        lineJoiningCenters.c = -lineJoiningCenters.b * center1.y - lineJoiningCenters.a * center1.x;
        point1 = Utility.getPointAtADistance(lineJoiningCenters.a, lineJoiningCenters.b,
            lineJoiningCenters.c, center1.x, center1.y, distCenter1ToIntLine);

        point2 = Utility.getPointAtADistance(lineJoiningCenters.a, lineJoiningCenters.b,
            lineJoiningCenters.c, center2.x, center2.y, distCenter2ToIntLine);

        // fix up to 3 decimal places.
        point = (point1[0].x.toFixed(3) === point2[0].x.toFixed(3) && point1[0].y.toFixed(3) === point2[0].y.toFixed(3) ||
            point1[0].x.toFixed(3) === point2[1].x.toFixed(3) && point1[0].y.toFixed(3) === point2[1].y.toFixed(3)) ?
            point1[0] : point1[1];

        intersectionLine.a = -lineJoiningCenters.b;
        intersectionLine.b = lineJoiningCenters.a;
        intersectionLine.c = -lineJoiningCenters.a * point.x + lineJoiningCenters.b * point.y;
        return Utility.getPointAtADistance(intersectionLine.a, intersectionLine.b, intersectionLine.c, point.x, point.y, resDistance);
    }

    // Given three collinear points p, q, r, the function checks if
    // point q lies on line segment 'pr'
    public static onSegment(p: Point, q: Point, r: Point): boolean {

        return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    }

    // To find orientation of ordered triplet (p, q, r).
    // The function returns following values
    // 0 --> p, q and r are collinear
    // 1 --> Clockwise
    // 2 --> Counterclockwise
    public static orientation(p: Point, q: Point, r: Point) {
        const val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);

        if (val === 0) {
            return 0;
        } // collinear

        return val > 0 ? 1 : 2; // clock or counter clockwise
    }

    public static doSegmentIntersect(p1: Point, q1: Point, p2: Point, q2: Point): boolean {

        const o1 = Utility.orientation(p1, q1, p2),
            o2 = Utility.orientation(p1, q1, q2),
            o3 = Utility.orientation(p2, q2, p1),
            o4 = Utility.orientation(p2, q2, q1);

        if (o1 !== o2 && o3 !== o4) {
            return true;
        }

        // p1, q1 and p2 are collinear and p2 lies on segment p1q1
        if (o1 === 0 && Utility.onSegment(p1, p2, q1)) {
            return true;
        }

        // p1, q1 and p2 are collinear and q2 lies on segment p1q1
        if (o2 === 0 && Utility.onSegment(p1, q2, q1)) {
            return true;
        }

        // p2, q2 and p1 are collinear and p1 lies on segment p2q2
        if (o3 === 0 && Utility.onSegment(p2, p1, q2)) {
            return true;
        }

        // p2, q2 and q1 are collinear and q1 lies on segment p2q2
        if (o4 === 0 && Utility.onSegment(p2, q1, q2)) {
            return true;
        }
        // Doesn't fall in any of the above cases
        return false;
    }

    public static calculateLineOutCode(x: number, y: number, xmin: number, xmax: number, ymin: number, ymax: number, boundary: number) {

        let code = 0;
        const LEFT = 1,
            RIGHT = 2,
            BOTTOM = 4,
            TOP = 8;
        if (typeof boundary === undefined || boundary === null) {
            boundary = 0;
        }
        if (isNaN(x) || isNaN(y)) {
            return -1;
        }
        if (x <= xmin + boundary) {
            code |= LEFT;
        } else if (x >= xmax - boundary) {
            code |= RIGHT;
        }
        if (y <= ymin + boundary) {
            code |= BOTTOM;
        } else if (y >= ymax - boundary) {
            code |= TOP;
        }
        return code;
    }

    public static doesLineIntersectRectangle(point1: Point, point2: Point, min: Point, max: Point) {

        let result;
        result = Utility.doSegmentIntersect(point1, point2, new Point(min.x, min.y), new Point(max.x, min.y));
        if (result) {
            return true;
        }

        result = Utility.doSegmentIntersect(point1, point2, new Point(max.x, min.y), new Point(max.x, max.y));
        if (result) {
            return true;
        }

        result = Utility.doSegmentIntersect(point1, point2, new Point(max.x, max.y), new Point(min.x, max.y));
        if (result) {
            return true;
        }

        result = Utility.doSegmentIntersect(point1, point2, new Point(min.x, max.y), new Point(min.x, min.y));
        return result;

    }

    public static intersectionOfLineAndCircle(center: Point, r: number, a: number, b: number, c: number): Point[] {

        let projOfCenterOnLine: Point, distance: number, distOfCenterToLine;
        projOfCenterOnLine = Utility.getProjectionOfPointOnLine(center.x, center.y, a, b, c);
        distOfCenterToLine = Utility.distance(center.x, center.y, projOfCenterOnLine.x, projOfCenterOnLine.y);
        if (distOfCenterToLine > r && Math.abs(distOfCenterToLine - r) > this.THRESHOLD_VALUE) {
            return void 0;
        }
        distance = (Math.abs(distOfCenterToLine - r) < this.THRESHOLD_VALUE) ?
            0 : Math.sqrt(Math.pow(r, 2) - Math.pow(distOfCenterToLine, 2));
        return Utility.getPointAtADistance(a, b, c, projOfCenterOnLine.x, projOfCenterOnLine.y, distance);
    }

    public static findSegmentPointAtADistance(startPoint: Point, endPoint: Point, distance: number): Point {
        let segmentDistance, ratio, x, y;
        segmentDistance = Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) + Math.pow(startPoint.y - endPoint.y, 2));
        ratio = segmentDistance === 0 ? 0 : distance / segmentDistance;
        x = (1 - ratio) * startPoint.x + ratio * endPoint.x;
        y = (1 - ratio) * startPoint.y + ratio * endPoint.y;
        return new Point(x, y);
    }

    public static getPointAtADistance(a: number, b: number, c: number, x: number, y: number, d: number): Point[] {

        let vx = -b,
            vy = a,
            ptDistance,
            vxd,
            vyd;
        const resultPt: Point[] = [];
        ptDistance = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
        vx /= ptDistance;
        vy /= ptDistance;
        vxd = vx * d;
        vyd = vy * d;
        resultPt.push(new Point(x + vxd, y + vyd));
        resultPt.push(new Point(x - vxd, y - vyd));
        return resultPt;
    }

    public static mean(n1: number, n2: number): number {
        if (n1 > 0 && n2 > 0) {
            return n1 + (n2 - n1) / 2;
        }
        return (n1 + n2) / 2;
    }

    public static isPaperRenderableValue(val: number): boolean {
        /* paper.js rendering causes problems when canvas co-ordinates goes beyond 10000 */
        return isFinite(val) && Math.abs(val) <= 10e10;
    }

    public static getProjectionOfPointOnLine(x: number, y: number, a: number, b: number, c: number): Point {

        const cp = -a * y + b * x,
            det = Math.pow(a, 2) + Math.pow(b, 2);
        return new Point((-c * a + b * cp) / det, (-a * cp - b * c) / det);
    }

    public static reflectPointAroundLine(x: number, y: number, a: number, b: number, c: number): Point {

        const coord = this.getProjectionOfPointOnLine(x, y, a, b, c),
            dx = coord.x - x,
            dy = coord.y - y;

        coord.x += dx;
        coord.y += dy;
        return coord;
    }

    public static areaOfIrregularPolygon(points: Point[]): number {

        // push first point again in the array of points before calling this function. (i.e. for triangle 4 points should be present).
        let i, areal = 0,
            arear = 0;
        for (i = 0; i < points.length - 1; i++) {
            areal += points[i].x * points[i + 1].y;
        }
        for (i = 0; i < points.length - 1; i++) {
            arear += points[i].y * points[i + 1].x;
        }
        return Math.abs(areal - arear) / 2;
    }

    public static reflectLineAroundLine(a1: number, b1: number, c1: number, a: number, b: number, c: number): number[] {
        return [
            a1 * (Math.pow(b, 2) - Math.pow(a, 2)) - b1 * a * b * 2,
            b1 * (Math.pow(a, 2) - Math.pow(b, 2)) - a1 * a * b * 2,
            c1 * (Math.pow(a, 2) + Math.pow(b, 2)) - c * (a * a1 + b * b1) * 2
        ];
    }

    public static dilateLine(a: number, b: number, c: number, x: number, y: number, ratio: number): Point {

        const cp = -a * y + b * x,
            det = Math.pow(a, 2) * Math.pow(b, 2),
            coord = [(-c * a + b * cp) / det, (-a * cp - b * c) / det];

        return this.dilatePoint(coord[0], coord[1], x, y, ratio);
    }

    public static dilatePoint(x: number, y: number, xc: number, yc: number, ratio: number): Point {
        return new Point(xc - (xc - x) * ratio, yc - (yc - y) * ratio);
    }

    public static getPolarCoordinate(x: number, y: number, isDeg: boolean) {
        const r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        let ang = Math.atan2(y, x);
        if (isDeg) {
            ang *= 180 / Math.PI; // 180 is pi radians
        }
        return [r, ang];
    }

    public static dotProduct(x1: number, y1: number, x2: number, y2: number): number {
        return x1 * x2 + y1 * y2;
    }

    public static midPoint(point1: Point, point2: Point): Point {
        return new Point((point2.x + point1.x) / 2, (point2.y + point1.y) / 2);
    }

    public static getAngleBetweenPoints(first: Point, common: Point, last: Point, isDeg: boolean): number {
        if (Math.abs(first.x - common.x) < this.THRESHOLD_VALUE && Math.abs(first.y - common.y) < this.THRESHOLD_VALUE ||
            Math.abs(common.x - last.x) < this.THRESHOLD_VALUE && Math.abs(common.y - last.y) < this.THRESHOLD_VALUE) {
            return 0;
        }
        let angle = Math.atan2(last.y - common.y, last.x - common.x) - Math.atan2(first.y - common.y, first.x - common.x);
        angle = isDeg ? angle * 180 / Math.PI : angle; // 180 is pi radians
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }

    public static getAngleBetweenLines(point1: Point, point2: Point, point3: Point, point4: Point)
        : number {
        let angle1, angle2, angleDifference;

        angle1 = Math.atan2(point2.y - point1.y, point2.x - point1.x);
        angle2 = Math.atan2(point4.y - point3.y, point4.x - point3.x);
        angleDifference = angle2 - angle1;
        angleDifference = Math.abs(angleDifference * 180 / Math.PI);

        if (angleDifference > 90) {
            angleDifference = 180 - angleDifference;
        }
        return angleDifference;
    }

    public static rotatePoint(point: Point, center: Point, angle: number, isDeg: boolean, reverse: boolean)
        : Point {
        if (isDeg) {
            angle *= Math.PI / 180; // 180 is pi radians
        }
        if (reverse) {
            angle *= -1;
        }
        const c = Math.cos(angle),
            s = Math.sin(angle),
            compXC = point.x - center.x,
            compYC = point.y - center.y;

        return new Point(center.x + compXC * c - compYC * s, center.y + compXC * s + compYC * c);
    }

    public static rotateLine(a: number, b: number, c: number, center: Point, angle: number, isDeg: boolean): any[] {
        if (isDeg) {
            angle *= Math.PI / 180; // 180 is pi radians
        }
        const cosOfAngle = Math.cos(angle),
            sinOfAngle = Math.sin(angle);
        return [
            a * cosOfAngle - b * sinOfAngle,
            a * sinOfAngle + b * cosOfAngle,
            a * center.x + b * center.y + c - (a * center.x + b * center.y) * cosOfAngle - (a * center.y - b * center.x) * sinOfAngle
        ];
    }

    public static getPolarCoordinates(point: Point, center: Point, isDeg: boolean): any[] {
        const dx = point.x - center.x,
            dy = point.y - center.y;
        let r,
            theta = Math.atan2(dy, dx);
        if (theta < 0) {
            theta += Math.PI * 2;
        }
        if (isDeg) {
            theta *= 180 / Math.PI; // 180 is pi radians
        }
        r = this.distance(point.x, point.y, center.x, center.y);
        return [r, theta];
    }

    public static getCartesianCoordinates(center: Point, r: number, theta: number, isDeg: boolean) {
        if (isDeg) {
            theta *= Math.PI / 180; // 180 is pi radians
        }
        return [center.x + r * Math.cos(theta), center.y + r * Math.sin(theta)];
    }

    public static translatePoint(point: Point, params: any, reverse: boolean) {
        const factor = reverse ? -1 : 1;
        if (params.coordinateSystem === "polar") {
            return this.rotatePoint(new Point(point.x + params.r, point.y), point, params.angle, true, reverse);
        }
        return new Point(point.x + params.dx * factor, point.y + params.dy * factor);
    }

    public static getXYInterceptsOfLine(a: number, b: number, c: number) {
        // Equation of line is in form ax+by+c=0
        let xIntercept, yIntercept;
        xIntercept = a === 0 ? null : (-c / a);
        yIntercept = b === 0 ? null : (-c / b);
        return {
            xIntercept,
            yIntercept
        };
    }

    public static getCanvasCoordinates(event: any): Point {
        return new Point(event.point.x, event.point.y);
    }

    public static getPointOnLineAfterDistance(start: Point, end: Point, distance: number, isInside: boolean): Point {
        const length = this.distanceWithPaper(start, end),
            vx = (end.x - start.x) / length,
            vy = (end.y - start.y) / length;
        if (isInside) {
            distance = -distance;
        }
        const x = start.x + vx * (length + distance),
            y = start.y + vy * (length + distance);
        return new Point(x, y);
    }

    public static getBoundaryPointsForLine(first: Point, last: Point): Point[] {
        const width = $(".drawing-graph").width(),
            height = $(".drawing-graph").height(),
            boundaries: Point[][] = [
                [new Point(0, 0), new Point(width, 0)],
                [new Point(0, 0), new Point(0, height)],
                [new Point(width, 0), new Point(width, height)],
                [new Point(0, height), new Point(width, height)]
            ],
            boundaryPoints: Point[] = [];
        for (let i = 0, j = 0; i < 4; i++) {
            const intersectingPoint = this.getLineIntersection(boundaries[i][j], boundaries[i][j + 1], first, last);
            if (intersectingPoint && intersectingPoint.x <= width && intersectingPoint.y <= height &&
                intersectingPoint.x >= 0 && intersectingPoint.y >= 0) {
                boundaryPoints.push(intersectingPoint);
            }
        }
        return boundaryPoints;
    }

    public static getLineIntersection(bigLineStart: Point, bigLineEnd: Point, smallLineStart: Point, smallLineEnd: Point): Point {
        const denom = (smallLineEnd.y - smallLineStart.y) * (bigLineEnd.x - bigLineStart.x) -
            (smallLineEnd.x - smallLineStart.x) * (bigLineEnd.y - bigLineStart.y);
        if (denom == 0) {
            return null;
        }
        const ua = ((smallLineEnd.x - smallLineStart.x) * (bigLineStart.y - smallLineStart.y) -
            (smallLineEnd.y - smallLineStart.y) * (bigLineStart.x - smallLineStart.x)) / denom,
            ub = ((bigLineEnd.x - bigLineStart.x) * (bigLineStart.y - smallLineStart.y) -
                (bigLineEnd.y - bigLineStart.y) * (bigLineStart.x - smallLineStart.x)) / denom,
            x = bigLineStart.x + ua * (bigLineEnd.x - bigLineStart.x),
            y = bigLineStart.y + ua * (bigLineEnd.y - bigLineStart.y);
        return new Point(x, y);
    }

    public static getArcParams(first: Point, common: Point, last: Point): ArcParameters {
        let arcParams: ArcParameters, tempPoint;
        arcParams = new ArcParameters();
        arcParams.from = this.getPointOnLineAfterDistance(first, common, canvasDistance, true);
        arcParams.to = this.getPointOnLineAfterDistance(last, common, canvasDistance, true);
        arcParams.angle = this.getAngleBetweenPoints(first, common, last, true);
        tempPoint = this.rotatePoint(arcParams.from, common, arcParams.angle / 2, true, false);
        if (arcParams.angle > 180) {
            tempPoint = this.getPointOnLineAfterDistance(tempPoint, common, canvasDistance, false);
            arcParams.angle = 360 - arcParams.angle;
        }
        if (Math.round(arcParams.angle) === 90) {
            tempPoint = this.getPointOnLineAfterDistance(common, tempPoint, canvasDistance * (Math.sqrt(2) - 1), false);
            arcParams.angle = 90;
        }
        arcParams.through = tempPoint;
        return arcParams;
    }

    public static getLineLengthCoord(drawingObject: DrawingObject, first: DrawingObject, second: DrawingObject): Point {
        const start = this.gridToCanvasCoordinate(first.position), end = this.gridToCanvasCoordinate(second.position),
            midPoint = this.midPoint(start, end),
            tempPoint = this.getPointOnLineAfterDistance(start, midPoint, 20, true),
            measurementPos1 = this.rotatePoint(tempPoint, midPoint, 90, true, false),
            measurementPos2 = this.rotatePoint(tempPoint, midPoint, 270, true, false);
        return PlotterView.checkHitTest(drawingObject, measurementPos1) ? measurementPos2 : measurementPos1;
    }

    public static canvasToGridCoordinate(canvasPointCoordinate: Point, snapToGrid?: boolean): Point {
        const graphData = GridGraph.GRAPH_DATA,
            curOrigin = graphData.graphOriginData.curOrigin,
            curDistanceBetweenTwoVerticalLines = graphData.gridParameters.curDistanceBetweenTwoVerticalLines,
            curDistanceBetweenTwoHorizontalLines = graphData.gridParameters.curDistanceBetweenTwoHorizontalLines,
            xGridLines = graphData.gridParameters.xGridLines,
            yGridLines = graphData.gridParameters.yGridLines,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            xTotalMultiplier = zoomingCharacteristics.xTotalMultiplier,
            yTotalMultiplier = zoomingCharacteristics.yTotalMultiplier;
        let gridPointCoordinate: Point,
            graphX,
            graphY;

        graphX = -((curOrigin.x - canvasPointCoordinate.x) / curDistanceBetweenTwoVerticalLines / xGridLines) * xTotalMultiplier;
        graphY = (curOrigin.y - canvasPointCoordinate.y) / curDistanceBetweenTwoHorizontalLines / yGridLines * yTotalMultiplier;

        gridPointCoordinate = new Point(graphX, graphY);

        return gridPointCoordinate;
    }

    public static gridToCanvasCoordinate(gridPointCoordinate: Point, snapToGrid?: boolean): Point {

        const graphData = GridGraph.GRAPH_DATA,
            curOrigin = graphData.graphOriginData.curOrigin,
            curDistanceBetweenTwoVerticalLines = graphData.gridParameters.curDistanceBetweenTwoVerticalLines,
            curDistanceBetweenTwoHorizontalLines = graphData.gridParameters.curDistanceBetweenTwoHorizontalLines,
            xGridLines = graphData.gridParameters.xGridLines,
            yGridLines = graphData.gridParameters.yGridLines,
            zoomingCharacteristics = graphData.zoomingCharacteristics,
            xTotalMultiplier = zoomingCharacteristics.xTotalMultiplier,
            yTotalMultiplier = zoomingCharacteristics.yTotalMultiplier;
        let canvasPointCoordinate: Point;
        let canvasX, canvasY;

        canvasX = curOrigin.x + gridPointCoordinate.x * xGridLines * curDistanceBetweenTwoVerticalLines / xTotalMultiplier;

        canvasY = curOrigin.y - gridPointCoordinate.y * yGridLines * curDistanceBetweenTwoHorizontalLines / yTotalMultiplier;

        canvasPointCoordinate = new Point(canvasX, canvasY);

        if (snapToGrid) {
            canvasPointCoordinate = Utility.getNearestCanvasPoint(canvasPointCoordinate);
        }

        return canvasPointCoordinate;
    }

    public static getNearestCanvasPoint(canvasPoint: Point): Point {
        let gridPoint: Point, nearestGridPoint: Point;

        gridPoint = Utility.canvasToGridCoordinate(canvasPoint);
        nearestGridPoint = Utility.getNearestGridPoint(gridPoint);
        return Utility.gridToCanvasCoordinate(nearestGridPoint);
    }

    public static getNearestGridPoint(point: Point): Point {
        let minDistance: number, counter: number, currentDistance: number, diagonalDistance: number,
            nearestPoint: Point, closerPoints: Point[];

        closerPoints = Utility.getNearestGraphPoints(point);

        diagonalDistance = this.distanceWithPaper(closerPoints[0], closerPoints[2]) * 0.2;

        for (counter = 0; counter < closerPoints.length; counter++) {
            currentDistance = Math.sqrt(Math.pow(point.x - closerPoints[counter].x, 2) + Math.pow(point.y - closerPoints[counter].y, 2));

            if (typeof minDistance !== "number") {
                minDistance = currentDistance;
                nearestPoint = closerPoints[counter];
            } else if (currentDistance < minDistance) {
                minDistance = currentDistance;
                nearestPoint = closerPoints[counter];
            }
        }
        if (minDistance > diagonalDistance) {
            return point;
        }
        return nearestPoint;
    }

    public static getNearestGraphPoints(point: Point): Point[] {
        let smallestXMultiplier: number, smallestYMultiplier: number,
            xMin: number, xMax: number, yMin: number, yMax: number,
            xSignValue: number, ySignValue: number,
            graphData: any, xGridLines: number, yGridLines: number,
            xTotalMultiplier: number, yTotalMultiplier: number;

        xSignValue = 1;
        ySignValue = 1;

        graphData = GridGraph.GRAPH_DATA;
        xGridLines = graphData.gridParameters.xGridLines;
        yGridLines = graphData.gridParameters.yGridLines;
        xTotalMultiplier = graphData.zoomingCharacteristics.xTotalMultiplier;
        yTotalMultiplier = graphData.zoomingCharacteristics.yTotalMultiplier;

        if (Math.abs(point.x) !== 0) {
            xSignValue = point.x / Math.abs(point.x);
        }
        if (Math.abs(point.y) !== 0) {
            ySignValue = point.y / Math.abs(point.y);
        }

        smallestXMultiplier = xSignValue * xTotalMultiplier;
        smallestYMultiplier = ySignValue * yTotalMultiplier;

        xMin = point.x % smallestXMultiplier;
        xMax = smallestXMultiplier - xMin;

        yMin = point.y % smallestYMultiplier;
        yMax = smallestYMultiplier - yMin;

        return [
            new Point(point.x - xMin, point.y - yMin),
            new Point(point.x + xMax, point.y - yMin),
            new Point(point.x - xMin, point.y + yMax),
            new Point(point.x + xMax, point.y + yMax)
        ];

    }

    public static getLabelCoordinate(drawingObject: DrawingObject, labelPoints: LabelPoints): Point {
        let finalPoint: Point, start: Point, common: Point, end: Point, rotate = rotateAngle,
            middle: DrawingObject, first: DrawingObject, last: DrawingObject,
            species = drawingObject.species;

        middle = labelPoints.current;
        first = labelPoints.previous;
        last = labelPoints.next;

        if (drawingObject.species === "angle") {
            species = labelPoints.current.species;
        }
        switch (species) {
            case "point":
                start = this.gridToCanvasCoordinate(middle.position);
                finalPoint = new Point(0, 0);
                finalPoint.x = start.x + canvasDistanceForPoint;
                finalPoint.y = start.y + canvasDistanceForPoint;
                break;
            case "segment":
                start = this.gridToCanvasCoordinate(first.position);
                end = this.gridToCanvasCoordinate(middle.position);
                finalPoint = this.getPointOnLineAfterDistance(start, end, canvasDistance, false);
                break;
            case "line":
                start = this.gridToCanvasCoordinate(first.position);
                end = this.gridToCanvasCoordinate(middle.position);
                common = this.getPointOnLineAfterDistance(start, end, canvasDistance, false);
                if (drawingObject.keyPoints[0] === first) {
                    rotate = 270;
                }
                finalPoint = this.rotatePoint(common, end, rotate, true, false);
                break;
            case "polygon":
                start = this.gridToCanvasCoordinate(first.position);
                common = this.gridToCanvasCoordinate(middle.position);
                end = this.gridToCanvasCoordinate(last.position);
                const pointInside = this.getArcParams(start, common, end).through,
                    x = common.x * 2 - pointInside.x,
                    y = common.y * 2 - pointInside.y,
                    label = new Point(x, y);
                finalPoint = label;
                if (PlotterView.checkHitTest(drawingObject, finalPoint)) {
                    finalPoint = pointInside;
                }
                break;
            case "length":
                start = this.gridToCanvasCoordinate(first.position);
                end = this.gridToCanvasCoordinate(middle.position);
                finalPoint = this.getPointOnLineAfterDistance(start, end, canvasDistance, false);
                const midPoint = this.midPoint(start, end),
                    tempPoint = this.getPointOnLineAfterDistance(start, midPoint, 20, true),
                    measurementPos1 = this.rotatePoint(tempPoint, midPoint, 90, true, false),
                    measurementPos2 = this.rotatePoint(tempPoint, midPoint, 270, true, false);
                finalPoint = measurementPos2;
        }
        return finalPoint;
    }
}
