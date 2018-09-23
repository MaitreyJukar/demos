var audioCtx;

var getAudioContext = function getAudioContext(ctx) {
    if (ctx !== void 0) {
        audioCtx = ctx;
        return ctx;
    }
    var AudioCtxCtor = top.AudioContext || top.webkitAudioContext;

    if (audioCtx !== void 0) {
        return audioCtx;
    }
    if (AudioCtxCtor) {
        audioCtx = new AudioCtxCtor();
    }

    // Check if hack is necessary. Only occurs in iOS6+ devices
    // and only when you first boot the iPhone, or play a audio/video
    // with a different sample rate
    if (/(iPhone|iPad)/i.test(navigator.userAgent) &&
        audioCtx.sampleRate !== 44100) {
        var buffer = audioCtx.createBuffer(1, 1, 44100);
        var ctxHack = audioCtx.createBufferSource();
        ctxHack.buffer = buffer;
        ctxHack.connect(audioCtx.destination);
        ctxHack.start(0);
        ctxHack.disconnect();

        audioCtx.close(); // dispose old context
        audioCtx = new AudioCtxCtor();
    }

    return audioCtx;
};

var loadAudioForAudioContext = function (strFilePath, successCb, failCb) {
    var audioReq = new XMLHttpRequest();
    audioReq.onreadystatechange = function (ev) {
        if (audioReq.readyState == XMLHttpRequest.DONE) {
            if (audioReq.status == 200) {
                initAudio(audioReq.response, successCb, failCb);
            }
            else {
                failCb(ev);
            }
        }
    };
    audioReq.onerror = failCb;
    audioReq.open("GET", strFilePath, true);
    audioReq.responseType = "arraybuffer";
    audioReq.send();
};

var initAudio = function initAudio(arraybuffer, resolve, reject) {
    audioCtx.decodeAudioData(arraybuffer, function (decodedData) {
        resolve(decodedData);
    }, function (failedData) {
        alert("Failed in initAudio", failedData);
        reject(failedData);
    });
}

$(document).ready(function () {
    var $loadBtn = $("#audio-loader");
    var $playBtn = $("#audio-play");
    var $stopBtn = $("#stop-play");
    var $logger = $("#logger");
    var $toggleBtn = $("#toggle");
    var ctx = getAudioContext(window && window.parent && window.parent.topCtx);
    var buffSrc;
    var gBuff;
    var sBuff;
    var type = "g";
    var sampleSound = "./../../content/common/media/audio/1-second-of-silence.mp3";

    loadAudioForAudioContext(sampleSound, function (buff) {
        sBuff = buff;
        buffSrc = ctx.createBufferSource();
        buffSrc.buffer = buff;
        buffSrc.loop = false;
        buffSrc.connect(ctx.destination);
        $loadBtn.removeAttr("disabled");

        $logger.append("<p>Loaded audio: " + sampleSound + ", Rate: " + buffSrc.buffer.sampleRate + "</p>");
        return buff;
    });

    $playBtn.attr("disabled", "disabled");
    $loadBtn.attr("disabled", "disabled");

    $loadBtn.on("touchend", function (eve) {
        loadAudioForAudioContext($("#file-path").val(), function (buff) {
            gBuff = buff;
            buffSrc = ctx.createBufferSource();
            buffSrc.buffer = buff;
            buffSrc.loop = false;
            buffSrc.connect(ctx.destination);
            $playBtn.removeAttr("disabled");

            $logger.append("<p>Loaded audio:" + $("#file-path").val() + ", Rate: " + buffSrc.buffer.sampleRate + "</p>");
            return buff;
        }, function (failedData) {
            alert("Failed in loadAudioForAudioContext", failedData);
        });
    });

    $playBtn.on("touchend", function (eve) {
        buffSrc = ctx.createBufferSource();
        buffSrc.buffer = (type === "g") ? gBuff : sBuff;
        buffSrc.connect(ctx.destination);
        buffSrc.start(0, 0, buffSrc.buffer.length);
        $logger.append("<p>Audio Started, Rate: " + buffSrc.buffer.sampleRate + "</p>");
    });

    $stopBtn.on("touchend", function (eve) {
        buffSrc.stop(0);
        $logger.append("<p>Audio Stopped, Rate: " + buffSrc.buffer.sampleRate + "</p>");
    });

    $toggleBtn.on("touchend", function (eve) {
        type = ((type === "s") ? "g" : "s");
        $logger.append("<p>Switched to " + ((type === "s") ? "Sample sound" : "Normal sound") + ", Rate: " + buffSrc.buffer.sampleRate + "</p>");
    });
});