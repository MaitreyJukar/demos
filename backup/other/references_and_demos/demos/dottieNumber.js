/*
https://www.reddit.com/r/dailyprogrammer/comments/3i99w8/20150824_challenge_229_easy_the_dottie_number/
*/

getFixedPoint = function (func, tries) {
	return function (num) {
		var _try = 0,
		output;
		while (_try++ < tries) {
			output = func(num);
			if (!isNaN(output) &&
				num !== output) {
				num = output;
			} else {
				break;
			}
		}
		return num;
	}
}

dottie1000 = getFixedPoint(Math.cos, 1000);

xMinusTanX1000 = getFixedPoint(function (x) {
		return x - Math.tan(x);
	}, 1000);

onePlusOneByX1000 = getFixedPoint(function (x) {
		return 1 + 1 / x;
	}, 1000);

fourXIntoOneMinusX1000 = getFixedPoint(function (x) {
		return 4 * x * (1 - x);
	}, 1000);

dottie1000(21);
xMinusTanX1000(2);
onePlusOneByX1000(5);
fourXIntoOneMinusX1000(0.5);