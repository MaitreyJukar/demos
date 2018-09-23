(function () {
	window.JSONCreator = {
		Collections: {},
		Models: {},
		Views: {},
		Templates: {}
	};

	/* Variable declarations */
	var mainModel,
		explorationData,
		locData,
		filesParsed = {
			algTileData: {},
			audioData: {},
			imageData: {}
		},
		filesSaved = {
			algFileData: {},
			audioFileData: {},
			imageFileData: {}
		},
		fileCount = {
			audio: 0,
			image: 0,
			algCount: 0
		},
		counter,
		localizedData = {
			localized_data: {}
		};

	/* Reset methods */

	function resetCounters() {
		counter = {
			caption: 1,
			desmos: 1,
			innerHTML: 1,
			algTiles: 1,
			altText: 1
		};
	}

	/* Exploration Creation */

	function createExploration() {
		hideInitialState();
		mainModel = new JSONCreator.Models.CreateJSON();
		new JSONCreator.Views.CreateJSON({
			el: ".main-container",
			model: mainModel
		});
	}

	function loadExploration() {
		if (explorationData && locData && Object.keys(filesParsed.algTileData).length == fileCount.algCount) {
			var modelData = combineLangAndData();
			mainModel = new JSONCreator.Models.CreateJSON(modelData);
			console.info(mainModel);
			new JSONCreator.Views.CreateJSON({
				el: ".main-container",
				model: mainModel
			});
		}
	}

	function parseZip(e) {
		if (this.files && this.files.length) {
			var inputFile = this.files[0],
				fileReader = new FileReader();
			fileReader.onload = onZipParsed;
			fileReader.readAsArrayBuffer(inputFile);
		}
	}

	function onZipParsed(e) {
		var loadedZip = JSZip.loadAsync(e.target.result).then(onZipReady);
	}

	function onZipReady(zip) {
		hideInitialState();
		console.log(zip);
		var files = [];
		for (var fileName in zip.files) {
			if (fileName.charAt(fileName.length - 1) != "/") {
				files.push(zip.files[fileName]);
			}
		}
		parseFileList(files);
	}

	function onDataLoaded(evt) {
		parseFileList(evt.target.files);
	}

	function parseFileList(files) {
		var $list = $("#file-list"),
			innerHTML = "";

		if (files.length) {
			for (var i = 0, len = files.length; i < len; i++) {
				file = files[i];
				extension = file.name.split(".").pop();
				innerHTML += "<li class='type-" + extension + "'>" + file.name + "</li>";
				parseFileData(file, extension);
			}
		}
		$list.html(innerHTML).removeClass("hide");
		hideInitialState();
		showLoadedFiles();
	}

	function onAlgebraRead(name, e) {
		var JSONString = typeof e === "string" ? e : e.target.result;
		filesParsed.algTileData[name] = JSON.parse(JSONString);
		loadExploration();
	}

	function onDataRead(e) {
		var JSONString = typeof e === "string" ? e : e.target.result;
		explorationData = JSON.parse(JSONString);
		loadExploration();
	}

	function onTextRead(e) {
		var JSONString = typeof e === "string" ? e : e.target.result;
		locData = JSON.parse(JSONString);
		loadExploration();
	}

	/* File data fetching methods */

	function parseFileData(file, extension) {
		switch (extension) {
			case "json":
				parseJSONData(file);
				break;
			case "mp3":
				parseAudioData(file);
				break;
			case "png":
			case "jpg":
			case "jpeg":
			case "gif":
				parseImageData(file);
				break;
		}
	}

	function parseJSONData(file) {
		var fileName = fixFileName(file.name, true);
		switch (fileName) {
			case "main.json":
				loadFile(file, onDataRead);
				break;
			case "loc.json":
				loadFile(file, onTextRead);
				break;
			default:
				if (fileName.indexOf("custom-algebra-tiles") > -1) {
					fileCount.algCount++;
					loadFile(file, onAlgebraRead.bind(this, fileName.split(".")[0]));
					break;
				}
		}
	}

	function parseAudioData(file) {
		fileCount.audio++;
		filesParsed.audioData[fixFileName(file.name)] = file;
	}

	function parseImageData(file) {
		fileCount.image++;
		filesParsed.imageData[fixFileName(file.name)] = file;
	}

	function loadFile(file, callback) {
		if (file instanceof Blob) {
			var reader = new FileReader();
			reader.onload = callback;
			reader.readAsText(file);
		} else {
			file.async("string").then(callback);
		}
	}

	/* Data Manipulation methods */

	function combineLangAndData() {
		return JSON.parse(JSON.stringify(explorationData), replaceData);
	}

	function replaceData(k, v) {
		switch (k) {
			case "innerHTML":
			case "desmosURL":
			case "caption":
			case "title":
			case "content":
			case "altText":
			case "postImgContent":
				return locData.localized_data[v];
			case "imgID":
				this.__id = v;
				return filesParsed.imageData[v];
			case "audioID":
				this.__id = v;
				return filesParsed.audioData[v];
			case "dataReference":
				switch (this.type) {
					case "custom":
						switch (this.subType) {
							case "grid":
								return filesParsed.algTileData[v];
							default:
								return v;
						}
					default:
						return v;
				}
			default:
				return v;
		}
	}

	function cleanEmptyData(k, v) {
		switch (k) {
			case "__id":
				return void 0;
			case "components":
				return v.length ? v : undefined;
			case "lcomponents":
			case "rcomponents":
				return v && v.components && v.components.length ? v : undefined;
			default:
				return v != null && (!Array.isArray(v) || (Array.isArray(v) && v.length)) ? v : undefined;
		}
	}

	function separateData(k, v) {
		var newKey;
		switch (k) {
			case "innerHTML":
				newKey = "innerHTML_" + counter.innerHTML;
				localizedData.localized_data[newKey] = v;
				counter.innerHTML++;
				return newKey;
			case "desmosURL":
				newKey = "desmosURL_" + counter.desmos;
				localizedData.localized_data[newKey] = v;
				counter.desmos++;
				return newKey;
			case "caption":
				newKey = "caption_" + counter.caption;
				localizedData.localized_data[newKey] = v;
				counter.caption++;
				return newKey;
			case "altText":
				newKey = "alttext_" + counter.caption;
				localizedData.localized_data[newKey] = v;
				counter.altText++;
				return newKey;
			case "title":
				newKey = "info_title";
				localizedData.localized_data[newKey] = v;
				return newKey;
			case "content":
				newKey = "info_content";
				localizedData.localized_data[newKey] = v;
				return newKey;
			case "postImgContent":
				newKey = "info_postImgContent";
				localizedData.localized_data[newKey] = v;
				return newKey;
			case "imgID":
				if (this.__id) {
					newKey = this.__id;
					filesSaved.imageFileData[newKey] = v;
					return newKey;
				} else {
					return v;
				}
			case "audioID":
				if (this.__id && v) {
					newKey = this.__id;
					filesSaved.audioFileData[newKey] = v;
					return newKey;
				}
				return void 0;
			case "__tooltipImgFile":
				if (this.additionalInfo && this.additionalInfo.image && this.additionalInfo.image.imgID) {
					newKey = this.additionalInfo.image.imgID;
					filesSaved.imageFileData[newKey] = v;
				}
				return void 0;
			case "dataReference":
				switch (this.type) {
					case "custom":
						switch (this.subType) {
							case "grid":
								newKey = "custom-algebra-tiles-" + counter.algTiles;
								filesSaved.algFileData[newKey] = v;
								counter.algTiles++;
								return newKey;
							default:
								return v;
						}
					default:
						return v;
				}
			default:
				return v;
		}
	}

	function fixFileName(fileName, keepExtension) {
		return keepExtension ? fileName.split("/").pop() : fileName.split("/").pop().split(".")[0];
	}

	/* DOM State Helper methods */

	function hideInitialState() {
		$(".initial-state").addClass("hide");
		$(".save-json-wrapper").removeClass("hide");
		attachSaveListener();
	}

	function showLoadedFiles() {
		$(".loaded-data").removeClass("hide");
	}

	/* Exploration Save methods */

	function saveExploration() {
		resetCounters();
		var mainJSON = JSON.parse(JSON.stringify(mainModel, separateData), cleanEmptyData);
		console.info(mainJSON);

		createPackage(mainJSON.explorationID, {
			main: mainJSON,
			loc: localizedData,
			custom: filesSaved.algFileData,
			audios: filesSaved.audioFileData,
			images: filesSaved.imageFileData
		});
	}

	function createPackage(name, data) {
		// Create folder structure
		var zip = new JSZip();
		var rootFolder = zip.folder(name);

		var dataFolder = rootFolder.folder("data");

		var langFolder = rootFolder.folder("lang");
		var enFolder = langFolder.folder("en");
		var enDataFolder = enFolder.folder("data");

		var enMediaFolder = enFolder.folder("media");
		var enAudioFolder = enMediaFolder.folder("audio");

		// Generate data JSON and lang JSON
		dataFolder.file("main.json", JSON.stringify(data.main, null, 4));
		enDataFolder.file("loc.json", JSON.stringify(data.loc, null, 4));

		// Generate audios
		if (Object.keys(data.audios).length) {
			for (var audioName in data.audios) {
				enAudioFolder.file(audioName + ".mp3", data.audios[audioName], {
					type: "blob"
				});
			}
		}

		// Generate images
		if (Object.keys(data.images).length) {
			var mediaFolder = rootFolder.folder("media");
			var imgFolder = mediaFolder.folder("images");
			var currImg;
			for (var imageName in data.images) {
				currImg = data.images[imageName];
				imgFolder.file(imageName + "." + currImg.name.split(".").pop(), currImg, {
					type: "blob"
				});
			}
		}

		// Generate custom exploration data
		if (Object.keys(data.custom).length) {
			for (var algJSON in data.custom) {
				dataFolder.file(algJSON + ".json", JSON.stringify(data.custom[algJSON], null, 4));
			}
		}

		// Download package
		zip.generateAsync({
			type: "blob"
		})
			.then(function (content) {
				saveAs(content, name + ".zip");
			});
	}

	function convertBlobToMP3(blobURL, fileName, cb) {
		var file = {};
		var xhr = new XMLHttpRequest();
		xhr.open('GET', blobURL, true);
		xhr.responseType = 'blob';
		xhr.onload = function (e) {
			if (this.status == 200) {
				file.file = this.response;
				file.name = fileName + ".mp3";
				// file.size = getYourBlobSize();
				file.type = "audio/mpeg";
				cb(file);
			}
		};
		xhr.send();
	}

	function generateAudioFromText(text) {
		return 'http://responsivevoice.org/responsivevoice/getvoice.php?t=' + text + '&tl=en-US';
	}

	function downloadData(storageObj, name) {
		name = name || "page-data";
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj, null, 4));
		var dlAnchorElem = $('#downloader')[0];
		dlAnchorElem.setAttribute("href", dataStr);
		dlAnchorElem.setAttribute("download", name + ".json");
		dlAnchorElem.click();
	}

	/* Styling methods */
	function attachHoverEvents(input, holder) {
		input.on("dragover", function (e) {
			holder.addClass("highlight-over");
			holder.removeClass("highlight-out");
		});

		input.on("dragleave", function (e) {
			holder.removeClass("highlight-over");
			holder.addClass("highlight-out");
		});

		input.on("dragend", function (e) {
			holder.removeClass("highlight-over");
			holder.addClass("highlight-out");
		});

		input.on("drop", function (e) {
			holder.removeClass("highlight-over");
			holder.addClass("highlight-out");
		});
	}

	function attachSaveListener() {
		$(document).on('keydown', function (e) {
			if (e.ctrlKey && (e.which == 83)) {
				e.preventDefault();
				saveExploration();
				return false;
			}
		});
	}

	$(document).ready(function () {
		var files,
			file,
			extension,
			$input = $("#file-URL"),
			holder = $("#file-holder");

		attachHoverEvents($input, holder);
		$input.on("change", onDataLoaded);
		$("#load-zip").on("change", parseZip);
		$(".new-json").on("click.newjson", createExploration);
		$(".save-json").on("click.savejson", saveExploration);
		resetCounters();
	});
})();