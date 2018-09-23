var sphere = new Group(),
sphereHeight = 100,
currentPosition = 0,
currentRadius = 0,
incrementFactor = 1,
sphereRadius = 50,
distance;

for (var i = 0; i < sphereHeight; i++) {
	distance = Math.abs(sphereRadius - currentPosition);
	increment = incrementFactor * Math.sqrt((sphereRadius * sphereRadius) - (distance * distance));
	currentRadius = increment;
	var shape = new Path.Ellipse({
			center : [0, currentPosition],
			radius : [currentRadius, currentRadius / 3],
			strokeColor : 'black',
			fillColor : new Color(1, 0, 0, 0.5)
		});
	currentPosition++;
	if (currentPosition === sphereRadius) {
		incrementFactor = -1;
	}
	sphere.addChild(shape);
}
sphere.position = view.center;
