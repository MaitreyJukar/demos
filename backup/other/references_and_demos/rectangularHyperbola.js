
/**
 * Compute coordinates to draw the hyperbola
 * @method _calculateHyperbolaPoints
 * @param slant{Number} Slop of Cone
 * @param slop{Number} Slop of Plane
 * @param offset{Number} Height of Plane
 * @private
 */
_calculateHyperbolaPoints = function (slant, slop) {
	var coneHeight = 10,
	heightFactor = 20,
	radius = (coneHeight * heightFactor / 2) / slant,
	equationConstants = {},
	offset = 20;

	coneHeight = (coneHeight * heightFactor) / 2;

	var count = 150,
	incrementFactor = (radius - (-radius)) / (count - 1),
	a = ((slop * slop) - (slant * slant)),
	b = 2 * slop * offset,
	index = 0,
	y,
	c,
	disc,
	x1,
	x2,
	z1,
	z2,
	temp;

	var coordinates1 = [],
	coordinates2 = [];
	while (index < count) {
		y = -radius + (index * incrementFactor);
		c = (offset * offset) - (slant * slant * y * y);
		disc = (b * b) - (4 * a * c);
		if (disc < 0) {
			disc = 0;
		}
		disc = Math.sqrt(disc);
		x1 = (-b - disc) / (2 * a);
		x2 = (-b + disc) / (2 * a);
		z1 = (slop * x1) + offset;
		z2 = (slop * x2) + offset;

		if (z2 < z1) {
			temp = x2;
			x2 = x1;
			x1 = temp;

			temp = z2;
			z2 = z1;
			z1 = temp;
		}
		if (z1 <= coneHeight && z1 >= -coneHeight) {
			coordinates1[coordinates1.length] = x1;
			coordinates1[coordinates1.length] = y;
			coordinates1[coordinates1.length] = z1;
			//console.log("Half1: x:" + x1 + " y:" + y + " z:" + z1);
		}
		if (z2 <= coneHeight && z2 >= -coneHeight) {
			coordinates2[coordinates2.length] = x2;
			coordinates2[coordinates2.length] = y;
			coordinates2[coordinates2.length] = z2;
			//console.log("Half2: x:" + x2 + " y:" + y + " z:" + z2);
		}
		index++;
	}
	// Equation of hyperbola: Ax2 + Bx + Cy2 + E=0
	// console.log("A:" + a + " B:" + b + " C:" + (-(slant*slant)) + " E:" + (offset * offset));

	offset = offset / heightFactor;
	equationConstants.A = a;
	equationConstants.B = 2 * slop * offset; //b;
	equationConstants.C = ( - (slant * slant));
	equationConstants.D = 0;
	equationConstants.E = (offset * offset);

	var temp = Math.sqrt((equationConstants.A - equationConstants.C) * (equationConstants.A - equationConstants.C) + equationConstants.B * equationConstants.B);
	var numerator = 2 * temp;
	var denominator = (equationConstants.A + equationConstants.C) + temp;
	//console.log(Math.sqrt(numerator / denominator));
	//console.log(Math.sqrt(-numerator / denominator));
	if (Math.abs(numerator / denominator) > 1.99 && Math.abs(numerator / denominator) < 2.01) {
		console.log('PLANE SLOPE',slop);
		console.log('CONE SLOPE',slant);
	}
}

for (var slant = 0.1; slant <= 20; slant = +(slant+0.1).toFixed(10)) {
	for (var slope = -20; slope <= 20; slope = +(slope+0.1).toFixed(10)) {
		if (Math.abs(slope) > slant) {
			_calculateHyperbolaPoints(slope, slant);
		}
	}
}
