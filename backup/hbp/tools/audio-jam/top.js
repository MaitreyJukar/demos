var topCtx;

var getAudioContext = function getAudioContext(ctx) {
    if (ctx !== void 0) {
        return ctx;
    }
    var AudioCtxCtor = top.AudioContext || top.webkitAudioContext;

    if (topCtx !== void 0) {
        return topCtx;
    }
    if (AudioCtxCtor) {
        topCtx = new AudioCtxCtor();
    }

    // Check if hack is necessary. Only occurs in iOS6+ devices
    // and only when you first boot the iPhone, or play a audio/video
    // with a different sample rate
    if (/(iPhone|iPad)/i.test(navigator.userAgent) &&
        topCtx.sampleRate !== 44100) {
        var buffer = topCtx.createBuffer(1, 1, 44100);
        var ctxHack = topCtx.createBufferSource();
        ctxHack.buffer = buffer;
        ctxHack.connect(topCtx.destination);
        ctxHack.start(0);
        ctxHack.disconnect();

        topCtx.close(); // dispose old context
        topCtx = new AudioCtxCtor();
    }

    return topCtx;
};

window.topCtx = getAudioContext();