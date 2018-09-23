import CommonUtilities = Utilities;
// tslint:disable-next-line:prefer-const
import { PathResolver } from "./path-resolver";
import * as Utilities from "./utilities";
// tslint:disable-next-line:prefer-const
let commonAsset: any;
let playerAsset: CommonResourcesStructure;
// tslint:disable-next-line:prefer-const
let playerConfig: any;
// tslint:disable-next-line:prefer-const
let playerTypeAsset: CommonResourcesStructure;

export interface BrowserDetect {
    name: string;
    os: string;
    version: string;
}

const { detect } = require("detect-browser");
const browser: BrowserDetect = detect();

const Language = Utilities.Language;

declare let webkitAudioContext: any;

export interface RequestData {
    id?: string;
    fileType: "image" | "json" | "audio" | string;
    url: string;
    type?: string;
    lang?: Utilities.Language;
    success?(data?: any): any;
}

export class AssetStructure {
    public id: string;
    public url: string;
    public type?: string;
    public lang?: Utilities.Language;
}

class MediaStructure {
    public images: AssetStructure[] = [];
    public audio: AssetStructure[] = [];
}

export class ResourcesStructure {
    public media: MediaStructure = new MediaStructure();
    public json: AssetStructure[] = [] as AssetStructure[];
}

class CommonResourcesStructure {
    [id: string]: ResourcesStructure;
}

class FileTypes {
    public IMAGE = "image";
    public JSON = "json";
    public AUDIO = "audio";
}

// tslint:disable-next-line:no-namespace
// namespace Language {
//     export const english = "en-us";
// }

export class Request {
    public successHandler: (data?: any) => void;
    private id: string;
    private url: string;
    private type: string;
    private fileType: string;
    private lang?: Utilities.Language;
    private resourceType: string;
    private resourceElement: any = null;
    private dependencies: string[];
    private dependents: string[];
    private errorHandler: () => void;
    private isConfig = false;

    get Id(): string {
        return this.id;
    }

    get Url(): string {
        return this.url;
    }

    set Url(url: string) {
        this.url = url;
    }

    get Lang(): Utilities.Language {
        return this.lang;
    }

    set Lang(lang: Utilities.Language) {
        this.lang = lang;
    }

    get ResourceType(): string {
        return this.resourceType;
    }

    get ResourceElement(): HTMLElement {
        return this.resourceElement;
    }

    set ResourceElement(resourceElement: HTMLElement) {
        this.resourceElement = resourceElement;
    }

    get SuccessHandler() {
        return this.successHandler;
    }

    get ErrorHandler() {
        return this.errorHandler;
    }

    constructor(data: any) {
        this.id = data.id;
        this.dependencies = data.dependencies || [];
        this.dependents = data.dependents || [];
        this.url = data.url || null;
        this.lang = data.lang || Utilities.Language.ENGLISH;
        this.type = data.type || null;
        this.resourceElement = null;
        this.resourceType = data.fileType || null;
        this.successHandler = data.success || null;
        this.errorHandler = data.error || null;
    }
}

export class Preloader {
    public static CONFIG_LOADED = "config-loaded";
    public static FILE_TYPES: FileTypes = new FileTypes();

    public static MAX_ACTIVE_REQUESTS = 10;
    public container: HTMLDivElement;
    public jsonData: any;
    public audioBuffer: any;
    public audioUrls: any;
    public app: any;
    public expId: string;
    public languagesAvailable: string[];
    public languageToLoad: string;

    private events: any;
    // A url --> reqObj map
    private requests: any = null;
    // All queues
    private completedRequests: Request[];
    private pendingRequests: Request[];
    private queuedRequests: Request[];

    private requestsCount: number;
    private loadedFiles: number;
    private totalCounter: number;
    private loadedCounter: number;
    private pathResolver: (data?: any, langName?: string) => string;
    private tagsToRemove: any;
    private audioContext: AudioContext;
    private loadingTextElm: HTMLElement;
    private percentCompleteElm: HTMLElement;
    private loadingText: string;
    private progressElm: HTMLElement;
    private preloaderErrorElm: HTMLElement;
    private isPreloading = false;
    private showPreloading = false;
    private cacheBuster = "?cb=1";
    private errorMsg: string;
    private DEBUG: boolean;

    get Container(): HTMLDivElement {
        return this.container;
    }

    // Preloader Events

    constructor(data: any) {
        this.completedRequests = [];
        this.pendingRequests = [];
        this.queuedRequests = [];
        data = data || {};

        // Loading flag
        this.isPreloading = false;
        this.showPreloading = data.showPreloading || false;
        this.loadingText = data.loadingTest || "";
        this.cacheBuster = data.cacheBuster || 1;
        this.cacheBuster = "?cb=" + this.cacheBuster;
        this.DEBUG = (data.DEBUG === void 0) ? false : data.DEBUG;

        // The jsonData to be forwarded on preload complete
        this.jsonData = [];
        this.audioBuffer = [];
        this.audioUrls = [];

        // The events hash
        this.events = {};
        this.requests = {};

        // The preloader el
        this.container = data.container || document.createElement("div");

        const defFnc = (reqData: any) => {
            if (reqData.url) {
                return reqData.url;
            }
            return false;
        };

        // Default path resolver to url
        this.pathResolver = data.pathResolver || defFnc;
        this.requestsCount = 1;
        this.totalCounter = 0;
        this.loadedCounter = 0;
    }

    // tslint:disable-next-line:max-line-length
    public preloadAsset(app: any, playerResources: ResourcesStructure, expId?: string, languagesAvailable: string[] = ["en"], languageToLoad?: string, playerName: string = "base-player") {
        // window.addEventListener("CONFIG_LOADED", this.onPreloaderJSONLoaded.bind(this));
        this.app = app;
        this.expId = expId;
        this.languagesAvailable = languagesAvailable;
        this.languageToLoad = languageToLoad;
        const resources: ResourcesStructure = new ResourcesStructure();
        // if (!this.app.langToLoad) {
        //     this.app.langToLoad = "en";
        // }
        // const languageUsed: string = Language.english;

        const locData = require("./../../player/" + playerName + "/data/loc.json");

        CommonUtilities.LocalizedData.playerLocDataEnglish = locData;
        CommonUtilities.LocalizedData.playerLocDataEspanol = locData;

        playerAsset = require("../../player/" + playerName + "/data/preloader-config.json");
        this.errorMsg = "error";

        // preload base player assets
        const basePlayerAssetsToLoad = playerAsset.resources;
        if (basePlayerAssetsToLoad.media.images) {
            for (const val of basePlayerAssetsToLoad.media.images) {
                resources.media.images.push(val);
            }
        }
        if (basePlayerAssetsToLoad.media.audio) {
            for (const val of basePlayerAssetsToLoad.media.audio) {
                resources.media.audio.push(val);
            }
        }

        // preload player assets
        const playerAssetsToLoad = playerResources;
        if (playerAssetsToLoad.media.images) {
            for (const val of playerAssetsToLoad.media.images) {
                resources.media.images.push(val);
            }
        }
        if (playerAssetsToLoad.media.audio) {
            for (const val of playerAssetsToLoad.media.audio) {
                resources.media.audio.push(val);
            }
        }
        if (playerAssetsToLoad.json) {
            for (const json of playerAssetsToLoad.json) {
                resources.json.push(json);
            }
        }
        return this.loadResources(resources);
    }

    public setLoadingText(text: string = null): Preloader {
        return this;
    }

    public setLoadingCount(count: number): Preloader {
        return this;
    }

    // Loads resources as contained in the JSON data
    public loadResources(resourcesData: ResourcesStructure) {
        let reqData: RequestData = null;
        let request: Request = null;
        // File types to load
        // Update totalCounter, if you add any file type
        let media: any = resourcesData.media || {};
        let images: any = media.images || [];
        const jsons: AssetStructure[] = resourcesData.json;
        const audio: any = media.audio || [];
        const totalCounter: number = images.length + audio.length + jsons.length;
        let resourceType: string = null;
        let length: number = null;
        let index = 0;

        this.requests = {};
        this.requestsCount = 1;
        if (this.isPreloading || totalCounter === 0) {
            images = media = null;
            return false;
        }

        // preloader.jsonData = {};
        this.isPreloading = true;
        this.loadedFiles = 0;
        this.totalCounter = totalCounter;
        this.tagsToRemove = [];

        if (this.showPreloading) {
            this.setLoadingCount(0).setLoadingText();
        }

        // Load images
        length = images.length;
        resourceType = Preloader.FILE_TYPES.IMAGE;
        for (index = 0; index < length; index += 1) {
            reqData = images[index];
            reqData.fileType = resourceType;
            this.createSeparateRequests(reqData);
        }

        // Load audio
        if (audio.length > 0) {
            this.audioContext = this.getAudioContext();
        }
        length = audio.length;
        resourceType = Preloader.FILE_TYPES.AUDIO;
        for (index = 0; index < length; index += 1) {
            reqData = audio[index];
            reqData.fileType = resourceType;
            this.createSeparateAudioRequests(reqData);
        }

        // Load jsons
        length = jsons.length;
        resourceType = Preloader.FILE_TYPES.JSON;
        for (index = 0; index < length; index += 1) {
            reqData = jsons[index] as RequestData;
            reqData.fileType = resourceType;
            request = this.createRequest(reqData);
            request.successHandler = ((req: Request, data: any) => {
                const parsedData = JSON.parse(data);
                Utilities.Utilities.loadedJsons[req.Id] = parsedData;
                this.loadComplete(req);
            }).bind(this, request);

            this.processRequest(request);
        }

        return true;
    }

    public getAudioContext(): AudioContext {
        let context: AudioContext = this.audioContext || null;
        if ((browser.name === "firefox" && browser.os === "Mac OS")) {
            return null;
        }
        if (this.DEBUG) {
            return null;
        }
        try {
            if (!context) {
                if (typeof AudioContext !== "undefined") {
                    context = new AudioContext();
                } else if (typeof webkitAudioContext !== "undefined") {
                    context = new webkitAudioContext();
                }
            }
            return this.audioContext = context;
        } catch (error) {
            Utilities.Utilities.logger.info(error);
        }

    }

    public createSeparateRequests(reqData: RequestData): void {
        if (reqData.type.indexOf("LANG") > 0) {
            const lang = this.languageToLoad;
            const reqClone = $.extend(true, {}, reqData);
            reqClone.lang = lang as any;
            reqClone.id = reqClone.id + "_" + lang;
            let request: Request = null;
            request = this.createRequest(reqClone);
            this.processRequest(request);
        } else {
            let request: Request = null;
            request = this.createRequest(reqData);
            this.processRequest(request);
        }
    }

    public createSeparateAudioRequests(reqData: RequestData): void {
        for (const langKey in Language) {
            if (langKey) {
                const lang = Language[langKey];
                const reqClone = $.extend(true, {}, reqData);
                reqClone.lang = lang as any;
                reqClone.id = reqClone.id + "_" + lang;
                let request: Request = null;
                request = this.createRequest(reqClone);
                this.processRequest(request);
            }
        }
    }

    public createRequest(reqData: RequestData): Request {
        let request: Request = null;
        let url: string = null;

        reqData.id = reqData.id || "request-" + this.requestsCount;
        url = this.pathResolver(reqData, reqData.lang);
        request = this.requests[reqData.id];
        if (request) {
            if (request.Url !== url) {
                Utilities.Utilities.logger.error("Found a request with duplicate id. Make sure the id is unique.",
                    this.requests[reqData.id]);
            }
            return this.requests[reqData.id];
        }
        request = new Request(reqData);
        request.Url = url;
        if (reqData.fileType == "image") {
            Utilities.Utilities.imageData.push({
                id: reqData.id,
                src: request.Url
            });
        }
        this.requests[request.Id] = request;
        this.requestsCount += 1;
        return request;
    }

    public isReqComplete(request: Request): boolean {
        return this.completedRequests.indexOf(request) > -1;
    }

    public isPendingReqStackFull(): boolean {
        return this.pendingRequests.length >= Preloader.MAX_ACTIVE_REQUESTS;
    }

    public areAllResourcesLoaded(): boolean {
        return this.loadedCounter === 0;
    }

    public processRequest(request: Request): Preloader {
        // Avoid multiple COMPLETE requests
        if (this.isReqComplete(request)) {
            return this;
        }

        if (this.isPendingReqStackFull()) {
            // If the pending stack is full, the requests needs to be patient
            if ((this.queuedRequests.indexOf(request) < 0) && (this.completedRequests.indexOf(request) < 0)) {
                // Push only the request which is not previously queued
                this.queuedRequests.push(request);
            } else if (this.showPreloading) {
                // increase counter as the file is already loaded
                // TODO: check if this is required after fixing counter issue
                this.totalCounter--;
            }
        } else {
            if ((this.pendingRequests.indexOf(request) < 0) && (this.completedRequests.indexOf(request) < 0)) {
                // Push only the request which is not previously pending
                this.pendingRequests.push(request);
                this.loadedCounter++;
                this.loadResource(request);
            } else if (this.showPreloading) {
                // increase counter as the file is already loaded
                // TODO: check if this is required after fixing counter issue
                this.totalCounter--;
            }
        }

        return this;
    }

    // Loads a resource (script || style || image)
    public loadResource(request: Request): Preloader {
        const tagsToRemove = this.tagsToRemove;
        const resourceElm: HTMLElement = null;
        const resourceType: string = request.ResourceType || null;

        switch (resourceType) {
            case Preloader.FILE_TYPES.IMAGE:
                this.loadImage(request);
                break;
            case Preloader.FILE_TYPES.AUDIO:
                this.loadAudio(request);
                break;
            case Preloader.FILE_TYPES.JSON:
                this.loadJson(request);
                break;
            default:
                // Do we need to load any other data
                Utilities.Utilities.logger.info("Unsupported types");
        }

        return this;
    }

    // Removes all the request tags from preloader-root,
    // sets isPreloading to false and
    // fires load complete with the jsonData cached during the process
    public triggerPreloadComplete(): Preloader {
        const container = document.getElementById("preloader");
        const tagsToRemove = this.tagsToRemove || [];
        const length = tagsToRemove.length;
        const index = 0;

        // Remove all the tags inserted during preloading
        // for (; index < length; index += 1) {
        //    container.removeChild(tagsToRemove[index]);
        // }

        // container.innerHTML = "";

        // container.style.display = "none";
        this.isPreloading = false;
        $(this.app).trigger("PRELOAD_COMPLETE", [
            {
                audioBuffer: this.audioBuffer,
                audioUrls: this.audioUrls,
                jsonData: this.jsonData
            }
        ]);
        this.loadedFiles = 0;
        return this;
    }

    // The load complete call back
    public loadComplete(request: Request): Preloader {
        let queuedRequest: Request;
        let loadedPercent: number;

        this.loadedCounter--;
        // Update trackers --> Move the request from pending to complete
        this.pendingRequests.splice(this.pendingRequests.indexOf(request), 1);
        this.completedRequests.push(request);

        if (this.showPreloading) {
            this.loadedFiles++;
            loadedPercent = Math.round(this.loadedFiles / this.totalCounter * 100);
            if (loadedPercent == 100) {
                /* Utilities.logger.info("loadedFiles: " + this.loadedFiles +
                    " totalCounter: " + this.totalCounter + " loadedPercent: " + loadedPercent); */
            }
            this.setLoadingCount(loadedPercent);
        }

        // If everything is loaded, fire the event and rest
        $(window).trigger("RESOURCE_LOAD", [
            { request }
        ]);

        if (this.areAllResourcesLoaded()) {
            this.triggerPreloadComplete();
        } else {
            // Trigger request that waited the most
            if (this.queuedRequests.length > 0) {
                queuedRequest = this.queuedRequests.splice(0, 1)[0];
                this.processRequest(queuedRequest);
            }
        }
        return this;
    }

    // Load complete attacher
    public bindLoadHandler(request: Request): any {
        return this.loadComplete.bind(this, request);
    }

    // The load error call back
    public loadError(request: Request): Preloader {
        Utilities.Utilities.logger.error("error for ", request);
        return this;
    }

    // The load error call back for audio files
    public loadAudioError(request: Request): Preloader {
        Utilities.Utilities.logger.error("[AUDIO FILE MISSING] ", request.Url);
        this.loadComplete(request);
        return this;
    }

    // Load error attacher
    public bindErrorHandler(request: Request): any {
        return this.loadError.bind(this, request);
    }

    public loadJson(request: Request): Preloader {
        const ajax = new CommonUtilities.Ajax();
        ajax.get({
            error: () => {
                if (request.ErrorHandler) {
                    request.ErrorHandler();
                }
                this.loadError(request);
            },
            success: request.SuccessHandler,
            url: request.Url
        });
        return this;
    }

    // Loads image
    public loadImage(request: Request): Preloader {
        const imageTag: HTMLImageElement = document.createElement("img");

        imageTag.style.display = "none";
        // Bind handlers
        imageTag.onload = this.bindLoadHandler(request);
        imageTag.onerror = this.bindErrorHandler(request);
        if (request.Url.indexOf("?") === -1) {
            imageTag.src = request.Url + this.cacheBuster;
        }

        // Append the tag to the container
        this.container.appendChild(imageTag);

        // Cache the tag in order to remove it later
        request.ResourceElement = imageTag;

        return this;
    }

    public loadAudio(request: Request): Preloader {
        // tslint:disable-next-line:no-this-assignment
        const preloader: Preloader = this;
        let ajax: CommonUtilities.Ajax;
        const responseType: string = this.audioContext ? "arraybuffer" : "blob";
        const successCb = (response?: ArrayBuffer) => {
            if (this.audioContext) {
                try {
                    this.audioContext.decodeAudioData(response,
                        (audioBuffer: AudioBuffer) => {
                            if (audioBuffer && this.audioBuffer) {
                                this.audioBuffer[request.Id] = audioBuffer;
                                this.audioUrls[request.Id] = document.location.href + request.Url;
                            }
                            if (request.SuccessHandler) {
                                request.SuccessHandler(audioBuffer);
                            }
                            preloader.loadComplete(request);
                        }, () => {
                            Utilities.Utilities.logger.info("handled");
                            preloader.loadComplete(request);
                        });
                } catch (e) {
                    Utilities.Utilities.logger.info("handled");
                    preloader.loadComplete(request);
                }
            } else {
                this.audioBuffer[request.Id] = response; // = response;
                preloader.loadComplete(request);
            }
        };

        const URL = (request.Url.indexOf("?") === -1) ? request.Url + this.cacheBuster : request.Url;
        ajax = new CommonUtilities.Ajax();
        ajax.getAudio({
            error: () => {
                if (request.ErrorHandler) {
                    request.ErrorHandler();
                }
                this.loadAudioError(request);
            },
            responseType,
            success: successCb,
            url: URL
        });

        return this;
    }

    // Hides the preloader
    public hide(cb?: (data?: any) => any) {
        const transitionEvent = "webkitTransitionEnd mozTransitionEnd MSTransitionEnd transitionend";
        const $container = $(this.container);
        const $loader = $(".loader", this.container);
        $loader.off(transitionEvent).one(transitionEvent, () => {
            $container.removeClass("fade-out-trans");
            $container.hide();
            if (typeof cb === "function") {
                cb();
            }
        });
        $container.addClass("fade-out-trans");
    }

    // Displays it back again
    public show(): Preloader {
        $(this.container).show();

        return this;
    }

    public loadScript(url: string, onLoad: (data?: any) => any, onFail: (data?: any) => any) {
        const scriptTag: HTMLScriptElement = document.createElement("script");

        scriptTag.onload = onLoad;
        scriptTag.onerror = onFail;
        if (url.indexOf("?") === -1) {
            scriptTag.src = url + this.cacheBuster;
        }
        scriptTag.src = (url.indexOf("?") === -1) ? url + this.cacheBuster : url;
        scriptTag.async = false;

        this.container.appendChild(scriptTag);
    }
}
