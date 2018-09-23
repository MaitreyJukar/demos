import * as SoundManager from "./sound-manager";
import { Utilities } from "./utilities";

export interface Source {
    paused: boolean;
    playing: boolean;
    stopped: boolean;
}

export interface ExtAudioBufferSourceNode extends AudioBufferSourceNode {
    id?: string;
}

export class WebAudioApiManager {

    public sources: { [id: string]: Source };
    public sourceNodes: { [id: string]: ExtAudioBufferSourceNode };
    public id: string;
    public _source: any;
    public _gainNode: GainNode;
    public _buffer: AudioBuffer;
    public _startOffset: number;
    public _startTime: number;
    public _volume = 1;
    public _playInLoop = false;
    public _context: AudioContext;
    public _soundManager: SoundManager.SoundManager;
    public _audioProgress: number;
    constructor(options: any) {
        let context: any = null;

        this._soundManager = options.soundManager;

        context = options.context;
        if (!context) {
            alert("Your browser does not support web audio API.");
        } else {
            this._context = context;
            this._initialize(options.id, options.buffer, options.callback);
        }
    }

    // _getAudioContext(): AudioContext {
    //    var self: WebAudioApiManager = this,
    //        context: AudioContext = self._context || null;

    //    if (!context) {
    //        if (typeof AudioContext !== 'undefined') {
    //            context = new AudioContext();
    //        }
    //        else if (typeof webkitAudioContext !== 'undefined') {
    //            context = new webkitAudioContext();
    //        }
    //    }
    //    return self._context = context;
    // }

    public _initialize(id: string, arraybuffer: AudioBuffer, initCallBack: any) {
        this.sources = {};
        this.sourceNodes = {};
        this.id = id;
        this._source = null;
        this._gainNode = null;
        this._buffer = arraybuffer;

        // this._decodeAudioData(arraybuffer, initCallBack);

        this._startOffset = 0;
        this._startTime = 0;
        this._volume = 1;
        this._playInLoop = false;

        if (typeof initCallBack === "function") {
            initCallBack();
        }
    }

    public _decodeAudioData(arraybuffer: ArrayBuffer, callback: any) {
        // decode the buffer into an audio source
        try {
            this._context.decodeAudioData(
                arraybuffer,
                (buffer: AudioBuffer) => {
                    if (buffer) {
                        this._buffer = buffer;
                    }
                    if (typeof callback === "function") {
                        callback();
                    }
                },
                () => {
                    Utilities.logger.info("decode _decodeAudioData error");
                    if (typeof callback === "function") {
                        callback("failed");
                    }
                }
            );
        } catch (e) {
            Utilities.logger.info("decode error");
            if (typeof callback === "function") {
                callback("failed");
            }
        }
    }

    public play(options?: any) {
        let source: ExtAudioBufferSourceNode = null;
        let gainNode: GainNode = null;
        let sourceID = "";
        let playInLoop = false;
        let volume: number = this._volume;
        let audioProgress: number;

        if (options) {
            playInLoop = options.playInLoop || playInLoop;
            volume = options.volume != null ? options.volume : volume;
        }

        this._volume = volume;

        this._playInLoop = this._playInLoop || playInLoop;

        if (!this._context) {
            Utilities.logger.error("AudioContext is not set...");
        }

        this._startTime = this._context.currentTime;
        gainNode = this._context.createGain();
        gainNode.gain.value = volume;
        sourceID = this.id + "_" + new Date().getTime() + (Math.random() * 1000);
        source = this._context.createBufferSource();
        source.id = sourceID;
        // Connect graph
        source.buffer = this._buffer;
        source.connect(gainNode);
        gainNode.connect(this._context.destination);
        this._audioProgress = window.setInterval(() => {
            this._soundManager.audioProgress(this.id, this._context.currentTime - this._startTime, source.buffer.duration);
        }, 100);
        audioProgress = this._audioProgress;
        source.onended = (event) => {
            let target: any = event.target || event.srcElement;
            const sourceId: string = target.id;
            const nodeData = this.sources[sourceId];
            clearInterval(audioProgress);
            if (nodeData.stopped || nodeData.playing) {
                this._startOffset = 0;
            } else {
                this._startOffset += this._context.currentTime - this._startTime;
            }

            target.onended = null;
            this._gainNode = null;

            if (!nodeData.stopped && !nodeData.paused) {
                this._soundManager.timeUpdateCheck(this.id, this._context.currentTime);
            }

            // tslint:disable-next-line:no-dynamic-delete
            delete this.sourceNodes[sourceId];
            // tslint:disable-next-line:no-dynamic-delete
            delete this.sources[sourceId];
            target = null;
        };
        // Start playback, but make sure we stay in bound of the buffer.
        source.start(0, this._startOffset % source.buffer.duration, source.buffer.duration);
        this.sources[source.id] = {
            paused: false,
            playing: true,
            stopped: false
        };
        this.sourceNodes[source.id] = source;
        this._gainNode = gainNode;
    }

    public pause() {
        let nodeData: any;
        let sourceNode: any;
        let looper: any;

        for (looper in this.sourceNodes) {
            if (looper) {
                sourceNode = this.sourceNodes[looper];
                nodeData = this.sources[sourceNode.id];
                if (nodeData.playing) {
                    sourceNode.stop(0);
                    this.sources[sourceNode.id] = {
                        paused: true,
                        playing: false,
                        stopped: false
                    };
                }
            }
        }
    }

    public stop() {
        let sourceNode: any;
        let looper: any;
        let nodeData: any;

        for (looper in this.sourceNodes) {
            if (looper) {
                sourceNode = this.sourceNodes[looper];
                nodeData = this.sources[sourceNode.id];
                if (sourceNode && (nodeData && nodeData.playing)) {
                    clearInterval(this._audioProgress);
                    sourceNode.stop(0);
                    this.sources[sourceNode.id] = {
                        paused: false,
                        playing: false,
                        stopped: true
                    };
                }
            }
        }
        this._startOffset = 0;
    }

    public setVolume(volume: number = 1) {
        if (this._gainNode) {
            volume = (typeof volume !== "undefined") ? volume : this._volume;
            this._gainNode.gain.value = volume;
            // this._gainNode.gain.setTargetAtTime(volume, this._context.currentTime, 0);
        }
    }

    public mute() {
        this.setVolume(0);
    }

    public unmute() {
        this.setVolume();
    }
}
