//Cellular Automata

var testData = '00000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000',
steps = 25;

var applyRule90 = function () {
	var cells = testData.split(''),
	totalCells = cells.length,
	newCells=[];
	for (var i = 0; i < totalCells; i++) {
		newCells[i] = cells[(i - 1 + totalCells) % totalCells]^cells[(i + 1) % totalCells];
	}
	testData = newCells.join('');
	console.log(testData.replace(/1/g,'x').replace(/0/g,' '));
}

// Implementation
console.log(testData.replace(/1/g,'x').replace(/0/g,' '));
while (steps--) {
	applyRule90();
}
