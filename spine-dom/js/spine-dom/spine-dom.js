var SpineDOM = function(data) {

};

SpineDOM.prototype.fetchAtlas = function() {

};

SpineDOM.prototype.readSingleFile = readSingleFile(evt) {
    var file = this.files[0];

    var reader = new FileReader();
    reader.onload = function(progressEvent) {
        // Entire file
        console.log(this.result);

        // By lines
        var lines = this.result.split('\n');
        for (var line = 0; line < lines.length; line++) {
            console.log(lines[line]);
        }
    };
    reader.readAsText(file);
}

SpineDOM.prototype.parseAtlas = function() {

};

SpineDOM.prototype.addPart = function() {

};