var longRadiusLength = 150,
shortRadiusLength = 50,
yIntercept = 200,
circleX = view.center.x,
circleY = view.center.y - yIntercept;

var ellipse = new Path.Ellipse({
		center : view.center,
		radius : [longRadiusLength, shortRadiusLength],
		strokeColor : 'black'
	});

var point = new Path.Circle({
		radius : 2,
		center : [circleX, circleY],
		fillColor : 'black'
	});

var longRadius = new Path.Line({
		from : ellipse.bounds.leftCenter,
		to : ellipse.bounds.rightCenter,
		strokeColor : 'blue',
		strokeWidth : 2
	});

var shortRadius = new Path.Line({
		from : ellipse.bounds.topCenter,
		to : ellipse.bounds.bottomCenter,
		strokeColor : 'red',
		strokeWidth : 2
	});

var fociDistance = Math.sqrt((longRadiusLength * longRadiusLength) - (shortRadiusLength * shortRadiusLength));

var foci1 = new Path.Circle({
		radius : 5,
		center : [ellipse.position.x - fociDistance, ellipse.position.y],
		fillColor : 'green'
	});

var foci2 = new Path.Circle({
		radius : 5,
		center : [ellipse.position.x + fociDistance, ellipse.position.y],
		fillColor : 'green'
	});

var slopeOfTangent = Math.sqrt(((yIntercept * yIntercept) - (shortRadiusLength * shortRadiusLength)) / (longRadiusLength * longRadiusLength));

var tangent1X = view.center.x + (view.center.y - (view.center.y + yIntercept)) / slopeOfTangent;
var tangent2X = view.center.x - (view.center.y - (view.center.y + yIntercept)) / slopeOfTangent;

var tangent1 = new Path.Line({
		from : point.position,
		to : [tangent1X, view.center.y],
		strokeColor : 'red',
		strokeWidth : 1
	});

var tangent2 = new Path.Line({
		from : point.position,
		to : [tangent2X, view.center.y],
		strokeColor : 'red',
		strokeWidth : 1
	});
