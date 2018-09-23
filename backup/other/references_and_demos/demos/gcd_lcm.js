GCD = function (a, b) {
	return !b ? a : GCD(b, a % b);
}

LCM = function (a, b) {
	return a * b / GCD(a, b);
}
