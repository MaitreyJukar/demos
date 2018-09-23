var center = new Point(50, 50);
var points = 12;
var radius1 = 200;
var radius2 = 40;
var path = new Path.Star(center, points, radius1, radius2);
path.strokeColor = 'black';

path.position = view.center;

var GetInterSectionOfTwoLines= function (ptStartLine_1, ptEndLine_1, ptStartLine_2, ptEndLine_2) {
            var x1 = ptStartLine_1.x;
            var y1 = ptStartLine_1.y;

            var p = ptStartLine_2.x;
            var q = ptStartLine_2.y;

            var dx1 = (ptStartLine_1.x - ptEndLine_1.x);
            var dy1 = (ptStartLine_1.y - ptEndLine_1.y);

            var dx2 = (ptStartLine_2.x - ptEndLine_2.x);
            var dy2 = (ptStartLine_2.y - ptEndLine_2.y);

            if ((dx1 == 0 && dy1 == 0) || (dx2 == 0 && dy2 == 0)) {
                return null;
            }

            var m2;
            m1 = (dx1 == 0) ? 1000000 : dy1 / dx1;
            m2 = (dx2 == 0) ? 1000000 : dy2 / dx2;
            if (m1 == m2) {
                return null;
            }

            var x = ((m1 * x1 - y1) - (m2 * p - q)) / (m1 - m2);
            var y = (m1 * (x - x1) + y1);

            x = (dx1 == 0) ? x1 : ((dx2 == 0) ? p : x);
            y = (dy1 == 0) ? y1 : ((dy2 == 0) ? q : y);

            var ptIntersection = { x: x, y: y };
            
            return ptIntersection;
        }

var placePoint = function (event) {
	var circle = new Path.Circle({
			center : event.point,
			radius : 2
		});
if(pointLiesInPolygon(event.point)){
	// Set the fill color of the circle to RGB red:
	circle.fillColor = new Color(0, 1, 0);
}
else{
    circle.fillColor = new Color(1, 0, 0);
}
}

var pointLiesInPolygon=function(point){
    
    if(pointIsInBounds(point)){
        return checkInsidePolygon(point);
    }
    return false;
}

var pointIsInBounds=function(point){
    var bounds=path.bounds;
    return (
        point.x>bounds.left&&
        point.x<bounds.right&&
        point.y>bounds.top&&
        point.y<bounds.bottom
        );
}

var checkInsidePolygon=function(point){
    var endPoint={
            x: path.bounds.right+1,
            y: point.y
        };
    var allSegments=path.segments;
    var totalSegments=allSegments.length;
    var intersections=0;
    var start=null;
    var end=null;
    var intersectionPoint=null;
    
    for(var i=0;i<totalSegments;i++){
        start=allSegments[i].point;
        end=allSegments[(i+1)%totalSegments].point;
        intersectionPoint=GetInterSectionOfTwoLines(point,endPoint,start,end);
        if(intersectionPoint&&
        intersectionPoint.x!==start.x&&
        intersectionPoint.y!==start.y&&
        intersectionPoint.x!==end.x&&
        intersectionPoint.y!==end.y){
            intersection+=1;
        }
    }
    
}

var entireArea = new Path.Rectangle(new Point(0, 0), view.size);

entireArea.fillColor = 'blue';
entireArea.fillColor.alpha = 0.5;

entireArea.onMouseDown = placePoint;
