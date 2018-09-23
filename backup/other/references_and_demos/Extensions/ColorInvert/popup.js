document.addEventListener('DOMContentLoaded', function () {
	chrome.tabs.getSelected(null, function (tab) {
		chrome.tabs.executeScript(null, {
			file : "contentscript.js"
		});
	});
}, false);
