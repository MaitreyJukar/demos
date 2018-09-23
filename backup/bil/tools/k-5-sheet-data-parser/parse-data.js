(function () {
    var JSONs = {};
    var lastJSON = null;
    var KEYS = {
        EXP_ID: "Expl ID",
        CAPTION: "Caption",
        EXP_TITLE: "Expl Title",
        QUES_ID: "Question ID",
        SUBJECT: "Subject",
        VO: "VO",
        VALIDATE: "Validation",
        CUSTOM_TOOL: "\"Custom Tool \"",
        HTML: "HTML Instruction Text",
        EXP_NO: "Exp #",
        SECTION: "Section",
        QUESTION_NO: "Question #",
        LRN_ITEM: "English Link",
        POSITION: "Position"
    };
    var counter;
    var dropdownText = [];
    var dropdownTextTemplate = '<option value="$expID$">$section$ Exploration $expNo$</option>';
    var indexFile;

    var titleText = [];
    var fileName;

    $(document).ready(function () {
        $.ajax({
            url: "../grunt-tasks/k-5-index.html",
            contentType: "text/plain",
            success: function (response) {
                indexFile = response;
                $(".data-file-name").on("change", onDataLoaded);
            }
        });
    });

    function onDataLoaded(event) {
        if (event.target.files && event.target.files.length) {
            var file = event.target.files[0];
            fileName = file.name.split(".")[0];
            loadFile(file, onDataRead);
        }
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

    function onDataRead(e) {
        var JSONString = typeof e === "string" ? e : e.target.result;
        parseJSONData(JSON.parse(JSONString));
    }

    function resetCounters() {
        counter = {
            caption: 1
        };
    }

    function capitalize(text) {
        return text.toLowerCase().replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function createPackage() {
        var zip = new JSZip(),
            explorationsFolder = zip.folder("explorations");

        // Create folders for all explorations
        for (var expID in JSONs) {
            addToPackage(explorationsFolder, expID, JSONs[expID]);
        }

        zip.file("dropdown.txt", dropdownText.sort().join("\n"));
        zip.file("titles.txt", titleText.sort().join("\n"));

        // Download package
        zip.generateAsync({
                type: "blob"
            })
            .then(function (content) {
                saveAs(content, fileName + ".zip");
            });
    }

    function addToPackage(explorationsFolder, name, data) {
        // Create folder structure
        var rootFolder = explorationsFolder.folder(name);
        rootFolder.file("index.html", indexFile);

        var dataFolder = rootFolder.folder("data");

        var langFolder = rootFolder.folder("lang");
        var enFolder = langFolder.folder("en");
        var enDataFolder = enFolder.folder("data");
        var enMediaFolder = enFolder.folder("media");
        var audioFolder = enMediaFolder.folder("audio");

        // Generate data JSON and lang JSON
        dataFolder.file("main.json", JSON.stringify(data.main, null, 4));
        enDataFolder.file("loc.json", JSON.stringify(data.loc, null, 4));
    }

    var exists = function (data) {
        return data && data.toLowerCase() != "no";
    };

    var parseJSONData = function (sheets) {
        console.log(sheets);
        for (var sheet in sheets) {
            parseSheet(sheets[sheet]);
        }
        console.log(JSONs);
        createPackage();
    };

    var parseSheet = function (sheetData) {
        var rows = sheetData.length;
        for (var i = 0; i < rows; i++) {
            if (!i) continue;
            parseRow(sheetData[i]);
        }
    };

    var parseRow = function (expData) {
        if (exists(KEYS.QUESTION_NO)) {
            var key = lastJSON;
            var dataJSONs;
            if (expData[KEYS.EXP_ID]) {
                resetCounters();
                key = expData[KEYS.EXP_ID];
                lastJSON = key;
                dataJSONs = getJSONs(expData);
                JSONs[key] = {
                    main: dataJSONs.main,
                    loc: dataJSONs.loc
                };

                dropdownText.push(dropdownTextTemplate
                    .replace("$section$", expData[KEYS.SECTION])
                    .replace("$expID$", expData[KEYS.EXP_ID])
                    .replace("$expNo$", expData[KEYS.EXP_NO]));

                titleText.push('"' + expData[KEYS.EXP_ID] + '": "' + expData[KEYS.EXP_TITLE] + '",');
            }

            addQuestionData(expData);

            addData(expData);
        }
    };

    var addData = function (expData) {
        var key = expData[KEYS.POSITION] ? expData[KEYS.POSITION].toLowerCase() : "";
        switch (key) {
            case "below":
                addComponent(expData, addNewComponentRow(), "learnosity", expData[KEYS.QUES_ID], expData[KEYS.QUESTION_NO] - 1, !!exists(expData[KEYS.VALIDATE]) && !exists(KEYS.CUSTOM_TOOL));
                break;
            case "replace":
            default:
                addPage(expData);
                break;
        }
    };

    var addNewComponentRow = function () {
        var pages = JSONs[lastJSON].main.pages;
        var lastPage = pages[pages.length - 1];
        var newComponentRow = [];
        lastPage.components.push(newComponentRow);
        return newComponentRow;
    };

    var addQuestionData = function (expData) {
        if (exists(expData[KEYS.CAPTION])) {
            var questionData = {};
            var queDataArr = JSONs[lastJSON].main.questionsData;
            var audioID = lastJSON.replace("int_exploration", "int_exploration_" + expData[KEYS.QUESTION_NO]);
            locKey = "caption_" + counter.caption;
            counter.caption++;
            JSONs[lastJSON].loc.localized_data[locKey] = expData[KEYS.CAPTION];
            questionData.caption = locKey;
            questionData.audioID = audioID;
            questionData.id = queDataArr.length;

            queDataArr.push(questionData);

            addResource(audioID);
        }
    };

    var getJSONs = function (expData) {
        var dataJSONs = {
            main: {
                explorationID: expData[KEYS.EXP_ID],
                useCustomStyle: false,
                useLargerFont: true,
                pages: [],
                questionsData: [],
                resources: {
                    media: {
                        audio: []
                    }
                }
            },
            loc: {
                localized_data: {}
            }
        };
        return dataJSONs;
    };

    var addResource = function (audioID, currJSON) {
        currJSON = currJSON ? currJSON : JSONs[lastJSON];
        currJSON.main.resources.media.audio.push({
            id: audioID,
            url: audioID + ".mp3",
            type: "EXPLORATION_LANG_AUDIO"
        });
    };

    var addPage = function (expData) {
        var pages = JSONs[lastJSON].main.pages;
        var components = [];
        var componentRow = [];
        components.push(componentRow);
        var pageData = {
            type: "layout",
            width: "100%",
            components: components
        };

        if (expData[KEYS.QUES_ID]) {
            addComponent(expData, componentRow, "learnosity", expData[KEYS.QUES_ID], expData[KEYS.QUESTION_NO] - 1, !!exists(expData[KEYS.VALIDATE]) && !exists(KEYS.CUSTOM_TOOL));
        }
        pages.push(pageData);
    };

    var addComponent = function (expData, components, type, data, quesID, validate) {
        var locKey,
            componentData = {};

        switch (type) {
            case "learnosity":
                componentData.type = type;
                componentData.dataReference = data;
                componentData.questionID = quesID;
                componentData.width = "100%";
                componentData.validate = validate;
                break;
            default:
                componentData.type = type;
                componentData.dataReference = data;
                componentData.questionID = quesID;
                componentData.width = "100%";
                componentData.validate = validate;
                break;
        }
        components.push(componentData);
    };

})();