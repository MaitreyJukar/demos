TextChangedOnDelete = function () {
	selection = getSelection();
	return !(isCursorAtLastLine() && isCursorAtLastChar() && selection.iStartIndex==selectioniEndIndex);
}
TextChangedOnBackspace = function () {
	return !(isCursorAtFirstLine() && isCursorAtFirstChar() && selection.iStartIndex==selectioniEndIndex);
}
