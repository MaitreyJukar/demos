var STEPS = [{
        "@start": "00:00:000",
        "@stop": "00:04:850",
        "@aniamtion_start_time": "00:01:860•00:00:322•00:00:322•00:00:322•00:00:322",
        "#cdata-section": "SPEAKER 1: Entering the formula equals vLOOKUP parentheses",
        "balloon_text": "SPEAKER 1: Entering the formula equals vLOOKUP parentheses"
    },
    {
        "@start": "00:04:960",
        "@stop": "00:11:390",
        "@aniamtion_start_time": "00:00:000•00:00:322•00:00:322•00:00:322•00:00:322•00:00:322",
        "#cdata-section": "D11 comma lookcost comma 2 in cell E11",
        "balloon_text": "D11 comma lookcost comma 2 in cell E11"
    },
    {
        "@start": "00:11:390",
        "@stop": "00:15:220",
        "#cdata-section": "compares the Applebee's order quantity, 400,",
        "balloon_text": "compares the Applebee's order quantity, 400,"
    },
    {
        "@start": "00:15:220",
        "@stop": "00:18:110",
        "#cdata-section": "to the first column of our table range.",
        "balloon_text": "to the first column of our table range."
    },
    {
        "@start": "00:18:110",
        "@stop": "00:23:800",
        "@aniamtion_start_time": "00:3:600",
        "#cdata-section": "Since 400 is greater than or equal to 0 and 400 is less than 500,",
        "balloon_text": "Since 400 is greater than or equal to 0 and 400 is less than 500,"
    },
    {
        "@start": "00:23:800",
        "@stop": "00:27:888",
        "@aniamtion_start_time": "00:03:299",
        "#cdata-section": "Excel enters a unit cost of $3.50.",
        "balloon_text": "Excel enters a unit cost of $3.50."
    }, {
        "@start": "00:28:930",
        "@stop": "00:32:509",
        "@aniamtion_start_time": "00:00:000",
        "#cdata-section": "Copying this formula down to E12 through E14",
        "balloon_text": "Copying this formula down to E12 through E14"
    }, {
        "@start": "00:32:509",
        "@stop": "00:37:100",
        "#cdata-section": "computes the unit price charged to each restaurant.",
        "balloon_text": "computes the unit price charged to each restaurant."
    },
    {
        "@start": "00:37:100",
        "@stop": "00:42:600",
        "@aniamtion_start_time": "00:00:000•00:00:322•00:00:322•00:00:322•00:00:322",
        "#cdata-section": "Entering into cell F11 the formula equals D11 times E11",
        "balloon_text": "Entering into cell F11 the formula equals D11 times E11"
    },
    {
        "@start": "00:42:600",
        "@stop": "00:46:620",
        "#cdata-section": "computes the total cost of the eclairs bought by Applebee's.",
        "balloon_text": "computes the total cost of the eclairs bought by Applebee's."
    }, {
        "@start": "00:46:620",
        "@stop": "00:50:600",
        "@aniamtion_start_time": "00:00:000",
        "#cdata-section": "Copying this formula down to the cell range F12 through F14",
        "balloon_text": "Copying this formula down to the cell range F12 through F14"
    }, {
        "@start": "00:50:600",
        "@stop": "00:54:587",
        "#cdata-section": "computes the cost of the eclairs bought by the other restaurants.",
        "balloon_text": "computes the cost of the eclairs bought by the other restaurants."
    }
];
var currentStep = 0;
var context = new AudioContext();
var source = null;
var audioBuffer = null;

var timeStrToNum = function (str) {
    var strs = str.split(":");
    for (var i = 0; i < strs.length; i++) {
        strs[i] = Number(strs[i]);
    }
    var num = (strs[0] * 60 * 1000) + (strs[1] * 1000) + (strs[2]);
    return num;
};

// Converts an ArrayBuffer to base64, by converting to string 
// and then using window.btoa' to base64. 
var bufferToBase64 = function (buffer) {
    var bytes = new Uint8Array(buffer);
    var len = buffer.byteLength;
    var binary = "";
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};


var base64ToBuffer = function (buffer) {
    var binary = window.atob(buffer);
    var buffer = new ArrayBuffer(binary.length);
    var bytes = new Uint8Array(buffer);
    for (var i = 0; i < buffer.byteLength; i++) {
        bytes[i] = binary.charCodeAt(i) & 0xFF;
    }
    return buffer;
};

function stopSound() {
    if (source) {
        source.stop(0);
    }
}

function playSound() {
    // source is global so we can call .stop() later.
    source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = false;
    source.connect(context.destination);
    source.onended = onAudioEnd;
    playSelectedSound();
}

function playSelectedSound() {
    var selection = Number($("#step").val());
    var step = STEPS[selection];
    var start = timeStrToNum(step["@start"]) / 1000;
    var stop = timeStrToNum(step["@stop"]) / 1000;
    var duration = stop - start;
    source.start(0, start, duration);
}

function pauseSound() {
    if (source) {
        source.stop(0);
    }
}

function onAudioEnd(e) {
    console.log(e);
}

function initSound(arrayBuffer) {
    var base64String = bufferToBase64(arrayBuffer);
    var audioFromString = base64ToBuffer(base64String);
    document.getElementById("hbp-sample-audio").src = "data:audio/mpeg;base64," + base64String;
    context.decodeAudioData(audioFromString, function (buffer) {
        // audioBuffer is global to reuse the decoded audio later.
        audioBuffer = buffer;
        var buttons = document.querySelectorAll('#play-button');
        buttons[0].disabled = false;
        buttons = document.querySelectorAll('#pause-button');
        buttons[0].disabled = false;
    }, function (e) {
        console.log('Error decoding file', e);
    });
}
// User selects file, read it as an ArrayBuffer and pass to the API.
var fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', function (e) {
    var reader = new FileReader();
    reader.onload = function (e) {
        initSound(this.result);
    };
    reader.readAsArrayBuffer(this.files[0]);
}, false);
// Load file from a URL as an ArrayBuffer.
// Example: loading via xhr2: loadSoundFile('sounds/test.mp3');
function loadSoundFile(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function (e) {
        initSound(this.response); // this.response is an ArrayBuffer.
    };
    xhr.send();
}