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
        DESMOS: "Desmos",
        ADD_INFO_BUTTON: "Additional Info Button Name",
        ADD_INFO_CONTENT: "Additional Info Button Text",
        CUSTOM_TOOL: "\"Custom Tool \"",
        HTML: "HTML Instruction Text",
        EXP_NO: "Exp #",
        SECTION: "Section",
        QUESTION_NO: "Question #"
    };
    var counter;
    var dropdownText = [];
    var dropdownTextTemplate = '<option value="$expID$">$section$ Exploration $expNo$</option>';
    var indexFile;

    var titleText = [];
    var fileName;

    $(document).ready(function () {
        $.ajax({
            url: "../grunt-tasks/index.html",
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
            caption: 1,
            desmos: 1,
            innerHTML: 1
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
            addQuestion(expData);
        }
    };

    var getJSONs = function (expData) {
        var dataJSONs = {
            main: {
                explorationID: expData[KEYS.EXP_ID],
                useCustomStyle: false,
                questions: [],
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
        if (exists(expData[KEYS.ADD_INFO_BUTTON])) {
            var audioID = expData[KEYS.EXP_ID].replace("19NA_", "").replace("_int_exploration", "");
            dataJSONs.loc.localized_data.info_title = capitalize(expData[KEYS.ADD_INFO_BUTTON]);
            dataJSONs.loc.localized_data.info_content = expData[KEYS.ADD_INFO_CONTENT];
            dataJSONs.main.additionalInfo = {
                title: "info_title",
                content: "info_content",
                position: "right",
                audioID: audioID
            };
            addResource(audioID, dataJSONs);
        }
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

    var addQuestion = function (expData) {
        var questions = JSONs[lastJSON].main.questions;
        var components = [];
        var questionData = {
            layouts: [{
                multi: false,
                components: components
            }]
        };
        var locKey;
        if (expData[KEYS.QUES_ID]) {
            addComponent(expData, components, "learnosity", expData[KEYS.QUES_ID]);
        }
        if (exists(expData[KEYS.DESMOS])) {
            addComponent(expData, components, "desmos", expData[KEYS.DESMOS]);
        }
        if (exists(expData[KEYS.CAPTION])) {
            var audioID = lastJSON.replace("19NA_", "").replace("int_exploration", "q" + expData[KEYS.QUESTION_NO]);
            locKey = "caption_" + counter.caption;
            counter.caption++;
            JSONs[lastJSON].loc.localized_data[locKey] = expData[KEYS.CAPTION];
            questionData.caption = locKey;
            questionData.audioID = audioID;
            addResource(audioID);
        }
        questionData.validate = !!exists(expData[KEYS.VALIDATE]);
        addComponent(expData, components, "controls", null);
        questions.push(questionData);
    };

    var addComponent = function (expData, components, type, data) {
        var locKey,
            componentData = {};
        switch (type) {
            case "learnosity":
                componentData.type = "learnosity";
                componentData.dataReference = data;
                break;
            case "desmos":
                componentData.type = "desmos";
                if (data.indexOf("geometry") > -1) {
                    componentData.desmosType = "geometry";
                } else {
                    componentData.desmosType = "calculator";
                }
                locKey = "desmosURL_" + counter.desmos;
                counter.desmos++;
                JSONs[lastJSON].loc.localized_data[locKey] = data;
                componentData.desmosURL = locKey;
                break;
            case "controls":
                componentData.type = "controls";
                break;
            default:
                componentData.type = type;
                componentData.dataReference = data;
                break;
        }
        components.push(componentData);
    };

})();