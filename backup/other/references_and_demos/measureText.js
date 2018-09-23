function getWidthOfText(txt, fontname, fontsize) {
	// Create a dummy canvas (render invisible with css)
	var c = document.createElement('canvas');
	// Get the context of the dummy canvas
	var ctx = c.getContext('2d');
	// Set the context.font to the font that you are using
	ctx.font = fontsize + 'px' + fontname;
	// Measure the string
	// !!! <CRUCIAL>  !!!
	var length = ctx.measureText(txt).width;
	// !!! </CRUCIAL> !!!
	// Return width
	return length;
}

