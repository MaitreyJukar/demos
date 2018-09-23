import * as CommonPathResolver from "./common/helper/path-resolver";
import * as CommonPreloader from "./common/helper/preloader";
import * as SoundManager from "./common/helper/sound-manager";
import Preloader = CommonPreloader.Preloader;
import PathResolver = CommonPathResolver.PathResolver;
import { Language, PromiseWrapper, Utilities } from "./common/helper/utilities";
import * as PlayerInitPackage from "./player/base-player/init";

declare interface ExtWindow extends Window {
    LoadState: any;
    cb?: number;
}

declare const window: ExtWindow;
declare const CACHEBUSTER: number;

declare class PreloaderRequestStruct {
    public type?: string;
    public url: string;
}

declare class AudioUrl {
    public id?: string;
    public url?: string;
}

declare class PreloaderAttr {
    public audioBuffer?: AudioBuffer;
    public audioUrls?: AudioUrl[];
}

declare class DesmosPreloadData {
    public isFirst: boolean;
    public exists: boolean;
    public typesToPreload: string[];
    public typesToLoad: string[];
}

export class BigIdeasLearningApp {
    public static CONFIG = {
        PRELOAD_FIRST_AUDIO: true
    };
    public static DESMOS_SCRIPTS = {
        calculator: "https://www.desmos.com/api/v1.2/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6",
        geometry: "https://www.desmos.com/api/v1.2/geometry.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
    };
    public onceHidden = false;
    public expID: string;
    public lazyLoadAudio: CommonPreloader.AssetStructure[];
    public BILApp: BigIdeasLearningApp = this;
    public soundManager: SoundManager.SoundManager;
    public player: PlayerInitPackage.Player;
    public playerData: any = {};
    public langToLoad: string;
    public languagesAvailable: string[] = [];
    public playerName = "base-player";
    private _playerLoaded = false;
    private _initialSoundReady = false;
    private _desmosReady = false;
    private _audioTagsReady = false;
    private _audioReadyPromise: PromiseWrapper<void>;
    private _clickRegistered = false;
    private _loadingDesmosScript = false;
    private _desmosData: DesmosPreloadData;
    private DEBUG = false; // Only for dev purpose..

    private preloader: Preloader;
    private resources: CommonPreloader.ResourcesStructure;
    constructor() {
        window.cb = (CACHEBUSTER !== void 0 && CACHEBUSTER !== null && typeof CACHEBUSTER === "number") ? CACHEBUSTER : 2;
        Utilities.logger.log("cb", window.cb);
        this.langToLoad = this.getQueryStringValue("lang") || Language.ENGLISH;
        $("html").attr("lang", this.langToLoad);
        this.preloader = new Preloader({
            DEBUG: this.DEBUG,
            cacheBuster: window.cb,
            container: document.getElementById("preloader"),
            pathResolver: (reqData: PreloaderRequestStruct, lang: Language) =>
                PathResolver.resolvePath(reqData, lang),
            showPreloading: true
        });
        this.attachClientLoadListener();
        this.loadJSON();
        this._audioReadyPromise = new PromiseWrapper();
    }

    public attachClientLoadListener(): any {
        document.body.addEventListener("learnosityloaded", () => {
            const res = {
                json: [] as CommonPreloader.AssetStructure[],
                media: {
                    audio: this.lazyLoadAudio,
                    images: [] as CommonPreloader.AssetStructure[]
                }
            };
            const boundCb = ((eve: JQuery.Event, data2: any) => {
                this.onPreloadComplete(data2);
            }).bind(this);

            this.tryHidingPreloader();
            if (this._audioTagsReady) {
                return;
            }
            Utilities.logger.log("addEventListener learnosityloaded");
            $(this).one("PRELOAD_COMPLETE", boundCb);
            if (!this.preloader.preloadAsset(this, res, this.expID, this.languagesAvailable, this.langToLoad, this.playerName)) {
                $(this).off("PRELOAD_COMPLETE", boundCb);
                if (!this._desmosData.exists) {
                    this.loadDesmosScript();
                }
            }
        });
    }

    public tryHidingPreloader(): any {
        const desmosReadyNRequired = (this._desmosReady || !this._desmosData.exists);
        Utilities.logger.log("tryHidingPreloader",
            this._playerLoaded,
            window.LoadState.learnosityReady,
            this._initialSoundReady,
            desmosReadyNRequired,
            !this.onceHidden);
        if (this._playerLoaded && window.LoadState.learnosityReady && this._initialSoundReady && desmosReadyNRequired && !this.onceHidden) {
            this.preloader.hide();
            this.onceHidden = true;
        }
    }

    public getQueryStringValue(key: string) {
        return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]"
            + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    }

    public loadJSON(): any {
        const languages = Language;
        const noOfLanguages = Object.keys(languages).length;
        let totalJsonsToLoad = noOfLanguages + 1;

        const errFnc = (error: any) => {
            Utilities.logger.warn("[File not found] Error loading localization data");
            totalJsonsToLoad--;
            if (totalJsonsToLoad == 0) {
                this.preloadData();
            }
        };

        const url = "./data/loc.json";
        this.getJSON(url).then((resp) => {
            for (const lang in Language) {
                if (lang) {
                    this.playerData[Language[lang]] = resp;
                    totalJsonsToLoad--;
                    this.languagesAvailable.push(Language[lang]);
                    if (totalJsonsToLoad == 0) {
                        this.preloadData();
                    }
                }
            }
        }, errFnc).catch(errFnc);

        const commonUrl = "./data/main.json";
        this.getJSON(commonUrl).then((resp) => {
            this.expID = resp.explorationID;
            Utilities.logger.log("explorationID", resp.explorationID);
            this.playerData.common = resp;
            totalJsonsToLoad--;
            if (totalJsonsToLoad == 0) {
                this.preloadData();
            }
        }).catch((error) => {
            Utilities.logger.error("Invalid exploration ID " + this.expID);
        });

        return this.playerData;
    }

    public preloadData(): void {
        this.resources = new CommonPreloader.ResourcesStructure();
        this.resources = this.playerData.common.resources;
        if (BigIdeasLearningApp.CONFIG.PRELOAD_FIRST_AUDIO) {
            const firstAudio = this.resources.media.audio.splice(0, 1);
            this.lazyLoadAudio = this.resources.media.audio;
            this.resources.media.audio = firstAudio;
        } else {
            this.lazyLoadAudio = this.resources.media.audio;
        }
        this._initialSoundReady = true;
        this._desmosData = this.populateDesmosData();
        if (this._desmosData.exists) {
            this.loadDesmosScript();
        }

        const boundCb = this.onInitialPreloadComplete.bind(this);
        $(this).one("PRELOAD_COMPLETE", boundCb);
        if (!this.preloader.preloadAsset(this, this.resources, this.expID, this.languagesAvailable, this.langToLoad, this.playerName)) {
            $(this).off("PRELOAD_COMPLETE", boundCb);
            this.onInitialPreloadComplete();
        }
    }

    public onPreloadComplete(preloaderOuput: PreloaderAttr): void {
        this.initSounds(preloaderOuput);
    }

    public initSounds(data: PreloaderAttr) {
        const soundManager: SoundManager.SoundManager = SoundManager.SoundManager.getInstance({ DEBUG: this.DEBUG });
        const playButton: HTMLButtonElement = document.getElementById("ipad-play-btn") as HTMLButtonElement;
        this.soundManager = soundManager;
        $(soundManager).on("AUDIO_TAGS_READY", this.onAudioTagsReady.bind(this));
        const silentSoundPromise = soundManager.initSounds(data.audioBuffer, data.audioUrls,
            document.getElementById("audio-container"), playButton);
        this._initialSoundReady = true;
    }

    public onAudioTagsReady(): void {
        this._audioTagsReady = true;
        Utilities.logger.log("Audio Tags Ready!!");
        this._audioReadyPromise.resolve();
        if (!this._desmosData.exists) {
            this.loadDesmosScript();
        }
    }

    public onInitialAudioTagReady(audioCount: number): void {
        Utilities.logger.log("Init Audio Tags Ready!! Total sounds:", audioCount + this.lazyLoadAudio.length);
        if ((audioCount + this.lazyLoadAudio.length) === 1) {
            this._audioTagsReady = true;
            this._audioReadyPromise.resolve();
            if (!this._desmosData.exists) {
                this.loadDesmosScript();
            }
        }
        this.tryHidingPreloader();
        if (!this._desmosData.exists) {
            this.initPlayer();
        }
    }

    public initPlayer(): void {
        Utilities.logger.log("init player");
        this.player = new PlayerInitPackage.Player();
        this.player.loadPlayer(this.playerData,
            { preloader: this.preloader, languagesAvailable: this.languagesAvailable, langToLoad: this.langToLoad });
        this._playerLoaded = true;
        $("#ipad-play-btn").on("click", (event: JQuery.Event<HTMLButtonElement>) => {
            if (this._clickRegistered) {
                return;
            }
            Utilities.logger.log("click registered");
            this._clickRegistered = true;
            this._audioReadyPromise.then((val) => {
                this.player.playInitialAudio(event);
                return val;
            }).catch((err) => {
                this.player.audioMissingFallback(event);
                return err;
            });
        });
        this.tryHidingPreloader();
    }

    private onInitialPreloadComplete(event?: JQuery.Event, data?: any) {
        let counter = 0;
        if (data && data.audioBuffer) {
            for (const key in data.audioBuffer) {
                if (data.audioBuffer.hasOwnProperty(key)) {
                    counter++;
                }
            }
        }
        if (counter !== 0) {
            const soundManager: SoundManager.SoundManager = SoundManager.SoundManager.getInstance({ DEBUG: this.DEBUG });
            const playButton: HTMLButtonElement = document.getElementById("ipad-play-btn") as HTMLButtonElement;
            this.soundManager = soundManager;
            $(soundManager).one("AUDIO_TAGS_READY", this.onInitialAudioTagReady.bind(this, counter));
            const silentSoundPromise = soundManager.initSounds(data.audioBuffer, data.audioUrls,
                document.getElementById("audio-container"), playButton);
        } else {
            this.tryHidingPreloader();
            if (!this._desmosData.exists) {
                this.initPlayer();
            }
        }
    }

    private populateDesmosData(): DesmosPreloadData {
        const typesToPreload: string[] = [];
        const typesToLoad: string[] = [];
        let exists = !!this.playerData.common.hasCustomDesmos;
        let isFirst = false;
        let firstQuestion = true;
        for (const question of this.playerData.common.questions) {
            const components = [];
            for (const layout of question.layouts) {
                if (layout.multi) {
                    components.push(...layout.lcomponents.components, ...layout.rcomponents.components);
                } else {
                    components.push(...layout.components);
                }
            }
            if (components && components.length) {
                for (const comp of components) {
                    if (comp.type === "desmos" || (comp.type === "custom" && comp.subType === "custom-desmos")) {
                        if (typesToLoad.indexOf(comp.desmosType) === -1) {
                            if (firstQuestion) {
                                typesToPreload.push(comp.desmosType);
                                isFirst = true;
                            }
                            typesToLoad.push(comp.desmosType);
                            exists = true;
                        }
                    }
                }
            }
            firstQuestion = false;
        }
        return { isFirst, exists, typesToPreload, typesToLoad };
    }

    private loadDesmosScript() {
        if (this._loadingDesmosScript) {
            return;
        }
        this._loadingDesmosScript = true;
        // const scriptToLoad = BigIdeasLearningApp.DESMOS_SCRIPTS[this._desmosData.typesToLoad[0]];
        const scriptToLoad = BigIdeasLearningApp.DESMOS_SCRIPTS.geometry;
        /*
        for (const desmosType of this._desmosData.typesToPreload) {
            this.preloader.loadScript(BigIdeasLearningApp.DESMOS_SCRIPTS.calculator, () => { }, () => { });
        }
        */

        this.preloader.loadScript(BigIdeasLearningApp.DESMOS_SCRIPTS.calculator,
            (data1?: any) => {
                if (scriptToLoad !== void 0) {
                    this.preloader.loadScript(scriptToLoad,
                        (data2?: any) => {
                            Utilities.logger.log("Desmos script loaded");
                            this._desmosReady = true;
                            this.tryHidingPreloader();
                            if (this._desmosData.exists) {
                                this.initPlayer();
                            }
                        }, () => {
                            Utilities.logger.log("failed to load");
                        });
                } else {
                    Utilities.logger.log("Desmos script loaded");
                    this._desmosReady = true;
                    this.tryHidingPreloader();
                    if (this._desmosData.exists) {
                        this.initPlayer();
                    }
                }
            }, () => {
                Utilities.logger.log("failed to load");
            });
    }

    /**
     * Returns Promise for parsed data.
     * @param url Valid json url, if not passed then model's current `algeData` will be parsed.
     */
    private getJSON(url?: string) {
        url = (url.indexOf("?") === -1) ? (url + "?cb=" + window.cb) : url;
        return new Promise<any>((res, rej) => {
            $.ajax({
                contentType: "application/json",
                error: rej,
                success: res,
                url
            });
        });
    }
}

$(document).ready(() => {
    const app: any = new BigIdeasLearningApp();
});
