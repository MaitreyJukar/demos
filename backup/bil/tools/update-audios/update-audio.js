(function () {
    var zip = new JSZip(),
        explorationsFolder = zip.folder("revised-explorations"),
        EXP_NAME_EXTRACTOR = /(\w+_c\d{2}_?s\d{2}_exp\d{1}).*/,
        COMMON_EXTRACTOR = /(\w+_exp\d{1}).*/,
        COURSE_STARTER = /^\b(19NA|20FL)/,
        RENAME_HELPER = /(\d{2}\w{2}.{2}_)(c\d{2})(s\d{2})(_.+)/;

    $(document).ready(function () {
        $("#audio-folder").on("change", onDataLoaded);
    });

    function onDataLoaded(evt) {
        if (evt.target.files && evt.target.files.length) {
            parseFileList(evt.target.files);
            downloadPackage();
        }
    }

    function parseFileList(files) {
        if (files.length) {
            for (var i = 0, len = files.length; i < len; i++) {
                parseFileData(files[i]);
            }
        }
    }

    function parseFileData(file) {
        // Extract folder name
        var matchedName = file.name.match(COMMON_EXTRACTOR)[1];

        // Extract course name 19NA or 20FL
        var course = matchedName.match(COURSE_STARTER);

        // Add 19NA if course name does not exist
        matchedName = course ? matchedName : ("19NA_" + matchedName);

        // Add underscores between Chapter and Section
        if(matchedName.match(RENAME_HELPER)){
            matchedName = matchedName.replace(RENAME_HELPER, "$1$2_$3$4");
        }
        var folderName = matchedName + "_int_exploration";
        addToPackage(folderName, file);
    }

    function addToPackage(name, file) {
        // Create folder structure
        explorationsFolder.file(name + "/media/audio/" + file.name, file, {
            type: "blob"
        });
    }

    function downloadPackage() {
        // Download package
        zip.generateAsync({
                type: "blob"
            })
            .then(function (content) {
                saveAs(content, "audios.zip");
            });
    }
})();