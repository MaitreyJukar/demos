var fallThroughSwitch = function (num, condition) {
	switch (num) {
	case 1:
		if (condition) {
			console.log(num, condition);
			break;
		}
	case 2:
		console.log(num, condition);
		break;
	default:
		console.log(num, condition);
		break;
	}
}
