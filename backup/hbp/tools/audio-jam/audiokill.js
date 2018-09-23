var base64Elem = document.getElementById("base64");
var base64DurationElem = document.getElementById("base64-ctime");
var loadBtn = document.getElementById("load-btn");
var playBtn = document.getElementById("play-btn");
var pawsBtn = document.getElementById("paws-btn");
var killBtn = document.getElementById("kill-btn");
var base64State = 0;
var killCount = 1;
var clonesLoaded = 0;
var htmlDump = document.getElementById("html-dump");

var generateLongString = function generateLongString() {
    var x = "1234567890";
    var iterations = 7;
    for (var i = 0; i < iterations; i++) {
        x += x + x;
    }
    return x;
};

var longString = generateLongString();


var loadIt = function loadIt() {
    base64Elem.addEventListener("canplaythrough", function () {
        document.getElementById("base64-duration").innerText = base64Elem.duration;
        onAudioLoad();
    });

    base64Elem.addEventListener("timeupdate", function () {
        base64DurationElem.innerText = base64Elem.currentTime;
    });

    base64Elem.addEventListener("error", console.info.bind(null, "base64 error", base64Elem.error));

    base64Elem.addEventListener("play", function () {
        base64State = 1;
        onPlay();
    });

    base64Elem.addEventListener("pause", function () {
        base64State = 0;
        onPause();
    });

    base64Elem.src = base64audio;
};

var onAudioLoad = function onAudioLoad() {
    disableBtn(loadBtn);
    enableBtn(playBtn);
    enableBtn(killBtn);
};

var onPlay = function () {
    if (base64State === 1) {
        disableBtn(playBtn);
        enableBtn(pawsBtn);
        disableBtn(killBtn);
    }
};

var onPause = function () {
    if (base64State === 0) {
        disableBtn(pawsBtn);
        enableBtn(playBtn);
        enableBtn(killBtn);
    }
};

var playIt = function playIt() {
    base64Elem.play();
};

var pawsIt = function playIt() {
    base64Elem.pause();
};

var killIt = function killIt() {
    clonesLoaded = 0;
    for (var i = 0; i < killCount; i++) {
        cloneAndLoadAudioElem();
    }
};

var cloneAndLoadAudioElem = function cloneAndLoadAudioElem() {
    var labRat = document.getElementById("lab-rat");
    var clone = labRat.cloneNode();
    clone.removeAttribute("id");
    clone.className = "clone";
    document.body.appendChild(clone);
    htmlDump.innerHTML += longString;
    clone.addEventListener("canplaythrough", function () {
        clonesLoaded++;
        htmlDump.innerHTML += longString;
        console.log("Mission Memory Massacre in progress");
        if (clonesLoaded == killCount) {
            console.log("Mission Memory Massacre Successful");
        }
    });
    clone.src = base64audio;
};

var disableBtn = function (btnElem) {
    return btnElem && btnElem.setAttribute && btnElem.setAttribute("disabled", "disabled");
};

var enableBtn = function (btnElem) {
    return btnElem && btnElem.removeAttribute && btnElem.removeAttribute("disabled");
};

loadBtn.addEventListener("click", loadIt);
playBtn.addEventListener("click", playIt);
pawsBtn.addEventListener("click", pawsIt);
killBtn.addEventListener("click", killIt);

document.addEventListener("keypress", function (ev) {
    switch (ev.which) {
        case 108:
            loadIt();
            break;
        case 97:
            playIt();
            break;
        case 115:
            pawsIt();
            break;
    }
});


