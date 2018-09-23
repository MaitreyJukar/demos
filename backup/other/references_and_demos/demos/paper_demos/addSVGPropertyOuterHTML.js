// TinyMCE throws errors in IE when accessing outerHTML property of SVG elements. Add outerHTMl property to SVG element prototypes.
function addSVGProperties($elem) {
	$elem.find('svg').parent().find('*').each(function () {
		if (typeof this.constructor.prototype.outerHTML === 'undefined') {
			Object.defineProperty(this.constructor.prototype, 'outerHTML', {
				get : function () {
					var newDiv = document.createElement("div");
					newDiv.appendChild(this);
					return newDiv.innerHTML;
				},
				set : function (value) {
					this.outerHTML = value;
				}
			});
		}
	});
}
