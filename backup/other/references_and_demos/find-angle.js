var circleAngle = 2 * Math.PI;

/*
 * Returns the normalizes angle value in radians,
 * such that, 0 <= angle < 2PI, when measured anticlockwise.
 *
 * @method normalizeAngle
 * @param {Number} angle Value of the angle in radians.
 * @return {Number} Normalized value of the angle in radians.
 */
var normalizeAngle = function (angle) {
	return (circleAngle + (angle % circleAngle)) % circleAngle;
}

/*
 * Returns the angle in radians between 'from' point and 'to' point;
 * when traversed through 'via' point. Clockwise angle returns negative value.
 * Anticlockwise angle returns positive value.
 *
 * @method getAngle
 * @param {Number} from Starting point measured in radians.
 * @param {Number} via Point through which the required angle must pass measured in radians.
 * @param {Number} to End point measured in radians.
 * @return {Number} Angle in radians between 'from' point and 'to' point.
 */
var getAngle = function (from, via, to) {
	from = normalizeAngle(from);
	via = normalizeAngle(via);
	to = normalizeAngle(to);

	var
	// Calculates the angle between 'via' and 'from' points.
	// 'circleAngle' has been added to 'via' to force 'angle1' to be a positive value.
	angle1 = ((circleAngle + via) - from) % circleAngle,

	// 'circleAngle' has been added to 'to' to force 'angle2' to be a positive value.
	// Calculates the angle between 'to' and 'via' points.
	angle2 = ((circleAngle + to) - via) % circleAngle,

	power =
		//Calculates the number of times the 'angle1' measurement exceeded PI
		parseInt(angle1 / Math.PI) +
		//Calculates the number of times the 'angle2' measurement exceeded PI
		parseInt(angle2 / Math.PI);

	return Math.pow(-1, power) * normalizeAngle(Math.pow(-1, power) * (angle1 + angle2));
	/*
	* Uncomment below part if answer for values where from and to are same but via isn't, e.g. (10,20,10),
	* should be 2PI and not 0.
	*/
	/*
	return (Math.pow(-1, power) * normalizeAngle(Math.pow(-1, power) * (angle1 + angle2))) || 
	(circleAngle * ((via - from) / ((via - from) || 1)));
	*/
}
