/*
https://www.reddit.com/r/dailyprogrammer/comments/3j3pvm/20150831_challenge_230_easy_json_treasure_hunt/
 */

var treasure = 'dailyprogrammer',
path,
testObj = JSON.parse('{"dlpgcack": false, "indwqahe": null, "caki": {"vvczskh": null, "tczqyzn": false, "qymizftua": "jfx", "cyd": {"qembsejm": [null, "dailyprogrammer", null],"qtcgujuki": 79, "ptlwe": "lrvogzcpw", "jivdwnqi": null, "nzjlfax": "xaiuf","cqajfbn": true}, "kbttv": "dapsvkdnxm", "gcfv": 43.25503357696589}, "cfqnknrm":null, "dtqx": "psuyc", "zkhreog": [null, {"txrhgu": false, "qkhe": false,"oqlzgmtmx": "xndcy", "khuwjmktox": 48, "yoe": true, "xode": "hzxfgvw","cgsciipn": 20.075297532268902}, "hducqtvon", false, [null, 76.8463226047357,"qctvnvo", null], [null, {"nlp": false, "xebvtnvwbb": null, "uhfikxc": null,"eekejwjbe": false, "jmrkaqky": null, "oeyystp": false}, [null, 10, "nyzfhaps",71, null], 40, null, 13.737832677566875], [true, 80, 20, {"weynlgnfro":40.25989193717965, "ggsirrt": 17, "ztvbcpsba": 12, "mljfh": false, "lihndukg":"bzebyljg", "pllpche": null}, null, [true, false, 52.532666161803895, "mkmqrhg", "kgdqstfn", null, "szse"], null, {"qkhfufrgac": "vpmiicarn", "hguztz": "ocbmzpzon", "wprnlua": null}], {"drnj": [null, false], "jkjzvjuiw": false,"oupsmgjd": false, "kcwjy": null}]}');

var genKey = function (obj, passKey) {
	if (!path) {
		newKey = null;
		for (var key in obj) {
			newKey = passKey ? passKey + '-' + key : key;
			if (typeof obj[key] === typeof {}) {
				newKey += '-' + genKey(obj[key], newKey);
			} else if (obj[key] === treasure) {
				path = newKey;
				return path;
			}
		}
	} else {
		return path;
	}
}

genKey(testObj);
console.log(path);
