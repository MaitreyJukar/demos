var shapes = paper.project.getItems({
		name : 'shape'
	});

var xPoints = [];
var yPoints = [];

var findIndex = function (array, search, index) {

	var idx = array.indexOf(search);
	while (idx != -1) {
		index.push(idx);
		idx = array.indexOf(search, idx + 1);
	}
}

for (var i = 0; i < shapes.length; i++) {
	for (var j = 0; j < shapes[i].segments.length; j++) {
		var index = [];
		findIndex(xPoints, Math.round(shapes[i].segments[j].point.x), index);
		if (index.length === 0) {
			xPoints.push(Math.round(shapes[i].segments[j].point.x));
			yPoints.push(Math.round(shapes[i].segments[j].point.y));
		} else {
			var found = false;
			for (var k = 0; k < index.length; k++) {
				if (yPoints[index[k]] === Math.round(shapes[i].segments[j].point.y)) {
					xPoints.splice(index, 1);
					yPoints.splice(index, 1);
					found = true;
				}
			}
			if (!found) {
				xPoints.push(Math.round(shapes[i].segments[j].point.x));
				yPoints.push(Math.round(shapes[i].segments[j].point.y));
			}
		}
	}
}

console.log(xPoints,yPoints);
