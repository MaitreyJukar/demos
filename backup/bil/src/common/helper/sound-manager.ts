import { Utilities } from "./utilities";
import * as WebAudioApiManager from "./webaudio-api-manager";

declare let webkitAudioContext: any;

export interface BrowserDetect {
    name: string;
    os: string;
    version: string;
}

const { detect } = require("detect-browser");
const browser: BrowserDetect = detect();

export class SoundManager {
    private static _instance: SoundManager;

    public playBtnElem: HTMLButtonElement;
    public soundTagMapping: any = {};
    public audioData: { [id: string]: any; src?: WebAudioApiManager.WebAudioApiManager | string } = {};
    public loadedSpriteIds: any = [];
    public originalAudioData: any = {};
    public currentPlayingMap: any = {};
    public pausedMultiple: any = [];
    public currentLoadingTags: any = [];
    public pausedState = false;
    public scheduledForPlaying: any = [];
    public scheduledForPause: any = [];
    public reloadSoundTime = 0;
    public reloadSoundCounter = 0;
    public soundData: any = {};
    public tagNumber = 0;
    public soundCallback: any = null;
    public currentPlayingId: string = null;
    public audioProgressInterval: any;
    public supportsWebAudioApi: boolean = !(browser.name === "firefox" && browser.os === "Mac OS") &&
        (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined");
    public _context: AudioContext;
    public currentSoundRequestComplete = 0;
    public totalSoundRequests = 0;
    public DEBUG: boolean;
    private _volume = 1;

    // The constructor should not be used, use getInstance() instead
    constructor(options?: any) {
        this.DEBUG = (options.DEBUG === void 0) ? false : options.DEBUG;
        if (this.DEBUG) {
            this.supportsWebAudioApi = false;
        }
        if (SoundManager._instance) {
            throw new Error("Error: Instantiation failed: Use SoundManager.getInstance() instead of new.");
        }
        this.getAudioContext();
    }

    // Returns the instance of SoundManager
    // @returns object {Singleton}

    public static getInstance(options?: any): SoundManager {
        if (!SoundManager._instance) {
            if (options === void 0) { options = {}; }
            SoundManager._instance = new SoundManager(options);
        }
        return SoundManager._instance;
    }

    public getAudioContext(): AudioContext {
        let context: AudioContext = this._context || null;

        try {
            if (!context) {
                if (typeof AudioContext !== "undefined") {
                    context = new AudioContext();
                } else if (typeof webkitAudioContext !== "undefined") {
                    context = new webkitAudioContext();
                }
            }
            return this._context = context;
        } catch (error) {
            Utilities.logger.info(error);
        }

    }

    public initSound(data: any) {
        const fileReader: FileReader = new FileReader();
        if (typeof data === "undefined") {
            data = this.soundData;
            const tags: any = this.soundTagMapping[data.id];
            const curTag: HTMLElement = document.getElementById(tags[tags.length - 1]);
            curTag.parentNode.removeChild(curTag);
        } else {
            this.soundData = data;
        }
        const audioTag: any = document.createElement("audio");

        audioTag.setAttribute("id", data.id);
        data.container.appendChild(audioTag);
        this.bindAudioEvents(audioTag);
        // for firefox 37 we set volume because sometimes it dosent mute.
        audioTag.volume = 0;
        audioTag.setAttribute("type", "audio/mpeg");
        audioTag.setAttribute("data-url", data.url);

        if (!data.json) {
            data.json = [{
                end: audioTag.duration,
                id: data.id,
                start: 0
            }];
        }

        this.originalAudioData[data.id] = data;

        audioTag.muted = true;

        if (this.supportsWebAudioApi) {
            this.afterAudioLoadComplete(data.buffer, data, audioTag);
        } else {
            fileReader.onload = () => {
                const audioSrcData: any = fileReader.result;
                this.afterAudioLoadComplete(audioSrcData, data, audioTag);
            };
            fileReader.readAsDataURL(data.buffer);
        }
    }

    /**
     * Starts initializing of all sounds, If buttonElem provided, It will return silent sound's load promise.
     */
    public initSounds(audioBuffer: any, audioUrls: any, container: HTMLElement, buttonElem?: HTMLButtonElement) {
        let looper: any;
        let length = 0;

        for (looper in audioBuffer) {
            if (looper) {
                length++;
            }
        }
        this.totalSoundRequests = length;
        if (length == 0) {
            $(this).trigger("AUDIO_TAGS_READY");
            return;
        }
        for (looper in audioBuffer) {
            if (looper) {
                this.initSound({
                    buffer: audioBuffer[looper],
                    container,
                    id: looper,
                    url: audioUrls[looper]
                });
            }

        }
        /*
        if (buttonElem) {
            let silenceBuffer: AudioBuffer;
            buttonElem.addEventListener("click", (eve) => {
                const aContext = this.getAudioContext();
                const buffSrc = aContext.createBufferSource();
                buffSrc.buffer = silenceBuffer;
                buffSrc.loop = false;
                buffSrc.connect(aContext.destination);
                buffSrc.start(0, 0, 0.6);
                Utilities.logger.info("Clicked  & Played");
            });
            return this.loadAudioForAudioContext("./../../zeus_common/media/audio/1-second-of-silence.mp3")
                .then((buffer) => {
                    silenceBuffer = buffer;
                    return buffer;
                });
        }
        */
    }

    public afterAudioLoadComplete(src: any, data: any, audioTag: any) {
        this.createSpriteData(data.json, data.id);

        if (this.supportsWebAudioApi) {
            // Raise audio load event only after webaudio api has finished initializing
            this.audioData[audioTag.id].src = new WebAudioApiManager.WebAudioApiManager({
                buffer: src,
                callback: () => {
                    this.audioData[audioTag.id].loaded = true;
                },
                context: this._context,
                id: audioTag.id,
                soundManager: this
            });
        } else {
            audioTag.src = src;
            audioTag.pause();
            this.audioData[audioTag.id].src = src;
            this.audioData[audioTag.id].loaded = true;
        }

        this.currentSoundRequestComplete++;
        if (this.totalSoundRequests == this.currentSoundRequestComplete) {
            $(this).trigger("AUDIO_TAGS_READY");
        }

    }

    public populateSoundTagMapping(soundId: string, tagId: string) {
        if (!this.soundTagMapping[soundId]) {
            this.soundTagMapping[soundId] = [];
        }
        if (this.soundTagMapping[soundId].indexOf(tagId) === -1) {
            this.soundTagMapping[soundId].push(tagId);
        }
    }

    public play(id: string, params: any = null) {
        const soundTags = this.soundTagMapping[id];
        let looper: any;
        let currentTag: any;
        let timer: any;
        let stopPreviousInstance: boolean;
        let stopAllSounds: boolean;
        let playInLoop: boolean;
        let volume = 1;

        if (params) {
            stopPreviousInstance = params.stopPreviousInstance || false;
            stopAllSounds = params.stopAllSounds || false;
            playInLoop = params.playInLoop || false;
            volume = params.volume || this._volume;
        }
        if (stopAllSounds) {
            this.pauseAllSounds(true);
        }
        if (soundTags) {
            if (stopPreviousInstance) {
                this.stop(id);
                currentTag = document.getElementById(soundTags[0]);
            } else {
                if (this.supportsWebAudioApi) {
                    currentTag = document.getElementById(soundTags[0]);
                } else {
                    for (looper = 0; looper < soundTags.length; looper++) {
                        if (!this.audioData[soundTags[looper]].playing && !this.audioData[soundTags[looper]].paused) {
                            currentTag = document.getElementById(soundTags[looper]);
                            break;
                        }
                    }
                    if (!currentTag) {
                        // currentTag = this.loadSound(this.originalAudioData[this.soundTagMapping[id][0]], soundTags.length + 1);
                    }
                }
            }
            if (this.pausedState) {
                if (this.scheduledForPlaying.indexOf(id) < 0) {
                    this.scheduledForPlaying.push(id);
                }
                return;
            }

            if (this.supportsWebAudioApi) {
                this._context.resume().then(() => {
                    volume = this._volume;
                    this.audioData[currentTag.id].sounds[id].playInLoop = playInLoop;
                    this.audioData[currentTag.id].src.play({ playInLoop, volume });
                    this.currentPlayingMap[currentTag.id] = id;
                    this.audioData[currentTag.id].playing = true;
                    this.audioData[currentTag.id].paused = false;
                    this.dispatchCustomEvent("AUDIO_PLAY", {
                        id
                    });
                });
            } else {
                // currentTag.play();
                timer = setInterval(() => {
                    if (this.audioData[currentTag.id] && this.audioData[currentTag.id].loaded) {
                        clearInterval(timer);
                        currentTag.pause();
                        currentTag.muted = false;
                        // for firefox 37 we set volume because sometimes it dosent mute.
                        currentTag.volume = 1;
                        if (!isNaN(currentTag.duration)) {
                            currentTag.currentTime = this.audioData[currentTag.id].sounds[id].start;
                        }
                        this.audioData[currentTag.id].sounds[id].playInLoop = playInLoop;
                        this.audioProgressInterval = setInterval(() => {
                            this.audioProgress(id, currentTag.currentTime, currentTag.duration);
                        }, 20);
                        currentTag.play();
                        currentTag.volume = volume;
                        this.currentPlayingMap[currentTag.id] = id;
                        this.audioData[currentTag.id].playing = true;
                        this.audioData[currentTag.id].paused = false;
                        this.dispatchCustomEvent("AUDIO_PLAY", {
                            id
                        });
                    }
                }, 10);
            }
        }
    }

    public resetToStart(id: string) {
        const soundTags = this.soundTagMapping[id];
        let looper: any;
        let audioTag: any;

        if (soundTags) {
            for (looper = 0; looper < soundTags.length; looper++) {
                if (this.supportsWebAudioApi) {
                    this.audioData[soundTags[looper]].src.resetToStart();
                } else {
                    audioTag = document.getElementById(soundTags[looper]);
                    audioTag.currentTime = 0;
                }
            }
        }
    }

    public pause(id: string) {
        const soundTags = this.soundTagMapping[id];
        let looper: any;
        let audioTag: any;
        if (soundTags) {
            for (looper = 0; looper < soundTags.length; looper++) {
                audioTag = document.getElementById(soundTags[looper]);
                if (this.supportsWebAudioApi) {
                    this.audioData[audioTag.id].src.pause();
                } else {
                    audioTag.pause();
                }
                this.audioData[audioTag.id].playing = false;
                this.audioData[audioTag.id].paused = true;
            }
            this.dispatchCustomEvent("AUDIO_PAUSE", {
                id
            });
        }
    }

    public seek(id: string, time: number) {
        const soundTags = this.soundTagMapping[id];
        let looper: any;
        let currentTag: any;
        if (soundTags) {
            for (looper = 0; looper < soundTags.length; looper++) {
                currentTag = document.getElementById(soundTags[looper]);
                if (!isNaN(currentTag.duration)) {
                    currentTag.currentTime = time;
                }
                currentTag.volume = 0;
                currentTag.muted = true;
                currentTag.play();
                currentTag.pause();
                currentTag.volume = 1;
                currentTag.muted = false;
            }
        }
    }

    public pauseAllSounds(toBeStopped: boolean = false) {
        let looper: any;
        let audioTag: any;

        if (!toBeStopped) {
            this.pausedState = true;
        }
        for (looper in this.currentLoadingTags) {
            if (looper) {
                this.scheduledForPause.push(this.currentLoadingTags);
            }
        }
        for (looper in this.currentPlayingMap) {
            if (looper) {
                audioTag = document.getElementById(looper);
                if (audioTag && this.currentPlayingMap[looper]) {
                    if (this.supportsWebAudioApi) {
                        this.audioData[audioTag.id].src.pause();
                    } else {
                        audioTag.pause();
                    }
                    this.audioData[audioTag.id].playing = false;
                    this.audioData[audioTag.id].paused = true;
                    if (!toBeStopped) {
                        this.pausedMultiple.push(audioTag.id);
                    }
                    if (toBeStopped) {
                        this.dispatchCustomEvent("AUDIO_STOP", {
                            id: this.currentPlayingMap[looper]
                        });
                    } else {
                        this.dispatchCustomEvent("AUDIO_PAUSE", {
                            id: this.currentPlayingMap[looper]
                        });
                    }
                }
            }
        }
    }

    public stop(id: string) {
        const soundTags = this.soundTagMapping[id];
        let looper: any;
        let audioTag: any;

        if (soundTags) {
            for (looper = 0; looper < soundTags.length; looper++) {
                if (this.supportsWebAudioApi) {
                    this.audioData[soundTags[looper]].src.stop();
                } else {
                    audioTag = document.getElementById(soundTags[looper]);
                    audioTag.pause();
                }
                this.audioData[soundTags[looper]].playing = false;
                this.audioData[soundTags[looper]].paused = false;
                if (this.currentPlayingMap[soundTags[looper]]) {
                    this.audioData[soundTags[looper]].sounds[id].playInLoop = false;
                    this.currentPlayingMap[soundTags[looper]] = null;
                }
            }
            clearInterval(this.audioProgressInterval);
            this.dispatchCustomEvent("AUDIO_STOP", {
                id
            });
        }
    }

    public stopAllSounds() {
        let looper: any;

        for (looper in this.currentPlayingMap) {
            if (this.currentPlayingMap[looper]) {
                this.stop(looper);
            }
        }
    }

    public stopAllSoundsExceptBG() {
        let looper: string;
        let soundData: any;

        for (looper in this.currentPlayingMap) {
            if (this.currentPlayingMap[looper]) {
                soundData = this.audioData[looper].sounds[this.currentPlayingMap[looper]];
                if (!soundData.playInLoop) {
                    this.stop(looper);
                }
            }
        }
    }

    public resumeOrPlay(id: string): boolean {
        const soundTags = this.soundTagMapping[id];

        if (!soundTags) {
            Utilities.logger.warn("[Audio not found] No audio data found with ID:", id);
            $(this).trigger("audio-missing");
            return false;
        }

        if (this.supportsWebAudioApi) {
            this.play(id);
        } else {
            if (!this.audioData[soundTags[0]].playing && !this.audioData[soundTags[0]].paused) {
                this.play(id);
            } else {
                this.resume(id);
            }
        }
        return true;
    }

    public resume(id: string) {
        const soundTags = this.soundTagMapping[id];
        let looper: any;
        let audioTag: any;
        let currentTime: number;
        let duration: number;

        if (soundTags) {
            for (looper = 0; looper < soundTags.length; looper++) {
                if (this.audioData[soundTags[looper]].paused) {
                    audioTag = document.getElementById(soundTags[looper]);
                    if (this.supportsWebAudioApi) {
                        this._context.resume().then(() => {
                            this.audioData[soundTags[looper]].src.play({
                                volume: this._volume
                            });
                        });
                    } else {
                        currentTime = audioTag.currentTime;
                        duration = audioTag.duration;
                        if (currentTime === duration) {
                            audioTag.currentTime = duration - 0.1;
                        }
                        audioTag.play();
                    }

                    this.audioData[soundTags[looper]].playing = true;
                    this.audioData[soundTags[looper]].paused = false;
                    break;
                }
            }
            this.dispatchCustomEvent("AUDIO_PLAY", {
                id
            });
        }
    }

    public resumeAllSounds() {
        let audioTag: any;
        let currentTime: number;
        let duration: number;

        this.pausedState = false;
        while (this.pausedMultiple.length > 0) {
            audioTag = document.getElementById(this.pausedMultiple.pop());
            if (this.supportsWebAudioApi) {
                this._context.resume().then(() => {
                    this.audioData[audioTag.id].src.play({
                        volume: this._volume
                    });
                });
            } else {
                currentTime = audioTag.currentTime;
                duration = audioTag.duration;
                // Fix for safari 6.2.8 where audio keeps playing in loop when played 2nd time
                if (currentTime === duration) {
                    audioTag.currentTime = duration - 0.1;
                }

                audioTag.play();
            }
            this.audioData[audioTag.id].playing = true;
            this.audioData[audioTag.id].paused = false;
            this.dispatchCustomEvent("AUDIO_PLAY", {
                id: this.currentPlayingMap[audioTag.id]
            });
        }
        this.scheduledForPause = [];
        while (this.scheduledForPlaying.length > 0) {
            this.play(this.scheduledForPlaying.pop());
        }
    }

    public mute(id: string) {
        const soundTags = this.soundTagMapping[id];
        let looper: any;
        let audioTag: any;
        let audioData: any;
        this._volume = 0;
        if (soundTags) {
            for (looper = 0; looper < soundTags.length; looper++) {
                audioTag = document.getElementById(soundTags[looper]);
                audioData = this.audioData[soundTags[looper]];
                if (this.supportsWebAudioApi) {
                    if (audioData.playing) {
                        audioData.src.mute();
                    }
                } else {
                    audioTag.muted = true;
                    // for firefox 37 we set volume because sometimes it dosent mute.
                    audioTag.volume = 0;
                }
            }
            this.dispatchCustomEvent("AUDIO_MUTE", {
                id
            });
        }
    }

    public skip(idArray: any = []) {
        let looper: any;
        let audioTag: any;

        for (looper in this.currentPlayingMap) {
            if (idArray.indexOf(this.currentPlayingMap[looper]) > -1) {
                audioTag = document.getElementById(looper);
                if (this.supportsWebAudioApi) {
                    this.audioData[audioTag.id].src.stop();
                } else {
                    if (!isNaN(audioTag.duration)) {
                        audioTag.currentTime = 0;
                    }
                    audioTag.pause();
                }
                this.currentPlayingId = null;
                this.audioData[audioTag.id].playing = false;
                clearInterval(this.audioProgressInterval);
                this.dispatchCustomEvent("AUDIO_PLAYBACK_COMPLETE", {
                    id: this.currentPlayingMap[looper]
                });
                this.currentPlayingMap[looper] = null;
            }
        }
    }

    public skipAudio(exceptions: any = []) {
        let looper: any;
        let audioTag: any;
        const currentPlayingMap = this.currentPlayingMap;

        exceptions = exceptions || [];
        for (looper in currentPlayingMap) {
            if (currentPlayingMap[looper] && exceptions.indexOf(currentPlayingMap[looper]) === -1) {
                audioTag = document.getElementById(looper);
                if (this.supportsWebAudioApi) {
                    this.audioData[audioTag.id].src.stop();
                } else {
                    if (!isNaN(audioTag.duration)) {
                        audioTag.currentTime = 0;
                    }
                    audioTag.pause();
                }
                this.currentPlayingId = null;
                this.audioData[audioTag.id].playing = false;
                clearInterval(this.audioProgressInterval);
                this.dispatchCustomEvent("AUDIO_PLAYBACK_COMPLETE", {
                    id: currentPlayingMap[looper]
                });
                this.currentPlayingMap[looper] = null;
            }
        }
    }

    public unmute(id: string) {
        const soundTags = this.soundTagMapping[id];
        let looper: any;
        let audioTag: any;
        let audioData: any;

        this._volume = 1;
        if (soundTags) {
            for (looper = 0; looper < soundTags.length; looper++) {
                audioTag = document.getElementById(soundTags[looper]);
                audioData = this.audioData[soundTags[looper]];
                if (audioData.playing) {
                    if (this.supportsWebAudioApi) {
                        audioData.src.unmute();
                    } else {
                        audioTag.muted = false;
                        // for firefox 37 we set volume because sometimes it dosent mute.
                        audioTag.volume = 1;
                    }
                }
            }
            this.dispatchCustomEvent("AUDIO_UNMUTE", {
                id
            });
        }
    }

    public createSpriteData(json: any, tagId: string) {
        const data: any = json;
        let looper = 0;
        const spriteData: any = {
            sounds: {}
        };

        for (; looper < data.length; looper++) {
            spriteData.sounds[data[looper].id] = {
                end: data[looper].end,
                start: data[looper].start,
                tagId
            };
            this.populateSoundTagMapping(data[looper].id, tagId);
        }
        this.audioData[tagId] = spriteData;
    }

    public bindAudioEvents(audioTag: any) {
        audioTag.ontimeupdate = () => {
            this.timeUpdateCheck(audioTag.id, audioTag.currentTime);
        };
    }

    public unload(id: string) {
        const soundTags = this.soundTagMapping[id];
        let curTag: any;
        let looper = 0;

        if (!soundTags) {
            return;
        }

        for (; looper < soundTags.length; looper++) {
            curTag = document.getElementById(soundTags[looper]);
            curTag.removeAttribute("src");
            // curTag.src = "";

            // tslint:disable-next-line:no-dynamic-delete
            delete this.originalAudioData[curTag.id];
            // tslint:disable-next-line:no-dynamic-delete
            delete this.audioData[curTag.id];
            if (curTag.parentNode) {
                curTag.parentNode.removeChild(curTag);
            }
            if (this.currentPlayingMap[curTag.id]) {
                // tslint:disable-next-line:no-dynamic-delete
                delete this.currentPlayingMap[curTag.id];
            }
        }
        // tslint:disable-next-line:no-dynamic-delete
        delete this.soundTagMapping[id];
    }
    public audioProgress(id: string, currentTime: number, duration: number): void {
        $(this).trigger("AUDIO_TIMEUPDATE", {
            "currentTime": currentTime,
            "sound-id": id,
            "totalTime": duration
        });
    }

    public timeUpdateCheck(id: string, currentTime: number) {
        let soundData: any;
        let endTime: number;
        let audioTag: any;
        let currentPlayingMapId: any;

        if (this.currentPlayingMap[id]) {
            soundData = this.audioData[id].sounds[this.currentPlayingMap[id]];
            if (this.supportsWebAudioApi) {
                currentPlayingMapId = this.currentPlayingMap[id];
                if (soundData.playInLoop) {
                    this._context.resume().then(() => {
                        this.audioData[id].src.play({
                            volume: this._volume
                        });
                    });
                    return;
                }
                this.currentPlayingId = null;
                this.audioData[id].playing = false;
                this.currentPlayingMap[id] = null;
                this.dispatchCustomEvent("AUDIO_PLAYBACK_COMPLETE", {
                    id: currentPlayingMapId
                });
            } else {
                audioTag = document.getElementById(id);
                endTime = soundData.end || audioTag.duration;
                audioTag.volume = this._volume;
                if (audioTag.currentTime >= endTime && this.audioData[audioTag.id].playing) {
                    if (soundData.playInLoop) {
                        if (!isNaN(audioTag.duration)) {
                            audioTag.currentTime = soundData.start;
                        }
                        audioTag.play();
                        return;
                    }
                    audioTag.pause();
                    this.currentPlayingId = null;
                    this.audioData[audioTag.id].playing = false;
                    clearInterval(this.audioProgressInterval);
                    this.dispatchCustomEvent("AUDIO_PLAYBACK_COMPLETE", {
                        id: this.currentPlayingMap[id]
                    });
                    this.currentPlayingMap[id] = null;
                }
            }

        }
    }

    public dispatchCustomEvent(name: string, event: any) {
        $(this).trigger(name, {
            "sound-id": event.id
        });
    }

    public setVolume(id: string, volume: number) {
        const soundTags = this.soundTagMapping[id];
        let looper: number;
        let audioTag: any;

        if (soundTags) {
            for (looper = 0; looper < soundTags.length; looper++) {
                audioTag = document.getElementById(soundTags[looper]);
                if (this.supportsWebAudioApi) {
                    this.audioData[audioTag.id].src.setVolume(volume);
                } else {
                    audioTag.volume = volume;
                }
            }
        }
    }
    /**
     * Loads audio file with ajax request.
     * @param strFilePath Audio file path.
     */
    private loadAudioForAudioContext(strFilePath: string) {
        return new Promise<AudioBuffer>((resolve, reject) => {
            const audioReq = new XMLHttpRequest();
            audioReq.onreadystatechange = (ev: Event) => {
                if (audioReq.readyState == XMLHttpRequest.DONE) {
                    if (audioReq.status == 200) {
                        this.initAudio(audioReq.response, resolve, reject);
                    } else {
                        reject(ev);
                    }
                }
            };
            audioReq.onerror = reject;
            audioReq.open("GET", strFilePath, true);
            audioReq.responseType = "arraybuffer";
            audioReq.send();
        });
    }

    /**
     * Decodes audio using audio context
     * @param arraybuffer Ajax response of audio file.
     * @param resolve callback function for decoding.
     */
    private initAudio(arraybuffer: ArrayBuffer, resolve: (value?: AudioBuffer) => void, reject: (reason?: any) => void) {
        const audioCtx = this.getAudioContext();
        try {
            audioCtx.decodeAudioData(arraybuffer, (decodedData) => {
                resolve(decodedData);
            }, (failedData) => {
                Utilities.logger.warn("Failed in initAudio", failedData);
                reject(failedData);
            });
        } catch (e) {
            Utilities.logger.info("handled", e);
            reject(e);
        }
    }
}
