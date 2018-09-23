createFizzBuzz = function (end, div1, div2) {
	var num = 0,
	str;
	while (num++ < end) {
		str = '';
		if (!(num % div1)) {
			str = 'FIZZ';
		}
		if (!(num % div2)) {
			str += 'BUZZ';
		}
		if (!str) {
			str = num;
		}
		console.log(str);
	}
}

createFizzBuzz(100, 3, 5);
