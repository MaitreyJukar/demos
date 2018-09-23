var findInObj = function (jsonObj, propName) {
	var found = false,
	findProp = function findProp(obj, prop) {
		if (!found) {
			var val = null;
			for (var i in obj) {
				if (i === prop) {
					return obj[i];
					found = true;
				} else if (typeof obj[i] === "object") {
					return findProp(obj[i], prop);
				}
				return null;
			}
		}
	}
	return findProp(jsonObj, propName);
}