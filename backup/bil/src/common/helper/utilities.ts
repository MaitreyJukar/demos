import * as _ from "underscore";
import "./../css/animations.styl";
import { SoundManager } from "./sound-manager";

declare const ENV: "local" | "development" | "production";

/**
 * Audio Data attributes class.
 */
export declare class AudioData {
    public error?: () => void;
    public responseType?: XMLHttpRequestResponseType | string;
    public success: () => void;
    public url?: string;
}

export enum Language {
    ENGLISH = "en",
    SPANISH = "es"
}

export const LocalizationKeyMAP = {
    en: "playerLocDataEnglish",
    es: "playerLocDataEspanol"
};

export declare class ImageData {
    public id?: string;
    public src?: string;
}

declare interface ExtWindow extends Window {
    LoadState: any;
    cb?: number;
    itemsApp: any;
}

declare const window: ExtWindow;

/**
 * Ajax class's get method attributes.
 */
export declare class GetMethodAttr {
    public error?: () => void;
    public responseType?: XMLHttpRequestResponseType | string;
    public success?: () => void;
    public url?: string;
    public authorization?: string;
}

/**
 * Ajax class's post method attributes.
 */
export declare class PostMethodAttr {
    public error?: (resp?: any) => void;
    public responseType?: XMLHttpRequestResponseType | string;
    public success?: (responce?: any) => void;
    public url?: string;
    public data?: any;
    public authorization?: string;
}

// tslint:disable-next-line:no-namespace
export namespace LocalizedData {
    export let playerLocDataEnglish: any;
    export let playerLocDataEspanol: any;
    export let explorationLocData: any = {};
    export let commonLocData: any;
    export let playerLocData: any;
}

export enum LocalizationDataType {
    "common" = 1, "player" = 2
}

type Position = number[][];

export const Overlap = {
    comparePositions: (pos1: number[], pos2: number[]) => {
        let r1;
        let r2;
        r1 = pos1[0] < pos2[0] ? pos1 : pos2;
        r2 = pos1[0] < pos2[0] ? pos2 : pos1;
        return r1[1] > r2[0] || r1[0] === r2[0];
    },
    getPositions: (elem: HTMLElement) => {
        const pos = elem.getBoundingClientRect();

        return [
            [pos.left, pos.right],
            [pos.top, pos.bottom]
        ];
    },
    overlaps: (elem1: HTMLElement, elem2: HTMLElement) => {
        const pos1 = Overlap.getPositions(elem1);
        const pos2 = Overlap.getPositions(elem2);
        return Overlap.comparePositions(pos1[0], pos2[0]) && Overlap.comparePositions(pos1[1], pos2[1]);
    }
};

export class Ajax {

    public xhr: XMLHttpRequest;

    constructor() {
        const xhr = new XMLHttpRequest();

        this.xhr = xhr;
    }

    /**
     * Get method for ajax.
     * @param data GetMethodAttr
     */
    public get(data: GetMethodAttr): void {
        const url: string = data.url;
        const successHandler: (data?: any) => void = data.success;
        const errorHandler: () => void = data.error;
        const xhr = this.xhr;

        xhr.open("GET", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        if (data.authorization !== void 0) {
            xhr.setRequestHeader("Authorization", data.authorization);
        }
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    if (successHandler) {
                        successHandler(xhr.response);
                    }
                } else {
                    if (errorHandler) {
                        errorHandler();
                    }
                }
            }
        };

        xhr.send();
    }

    /**
     * Post method for ajax.
     * @param attr PostMethodAttr
     */
    public post(attr: PostMethodAttr): void {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", attr.url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        if (attr.authorization !== void 0) {
            xhr.setRequestHeader("Authorization", attr.authorization);
        }
        // Convert data to string..
        if (typeof attr.data !== "string") {
            attr.data = JSON.stringify(attr.data);
        }

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    if (attr.success) {
                        attr.success(xhr.response);
                    }
                } else {
                    if (attr.error) {
                        attr.error(xhr);
                    }
                }
            }
        };

        xhr.send(attr.data);
    }

    public getAudio(data: AudioData) {
        const url: string = data.url;
        const successHandler: (data?: any) => void = data.success;
        const errorHandler: () => void = data.error;
        const xhr = this.xhr;
        const responseType = data.responseType || "arraybuffer";

        xhr.open("GET", url, true);
        xhr.responseType = responseType as XMLHttpRequestResponseType;

        xhr.onload = () => {
            if (xhr.status == 200) {
                if (successHandler) {
                    successHandler(xhr.response);
                }
            } else {
                if (errorHandler) {
                    errorHandler();
                }
            }
        };

        xhr.onerror = () => {
            if (errorHandler) {
                errorHandler();
            }
        };

        xhr.send();
    }

}

declare class KeyValueObj {
    [id: string]: any;
}

/**
 * Event Controller class's supporting attributes.
 */
export declare class EventCtrlAttr {
    public callback: () => any;
    public interval?: number; // Interval in ms.
    public pushFrwrd?: number; // Time to monitor new trigger in ms.
}

export class EventController {
    public id = Number(_.uniqueId());

    public interval = 45000;

    public pushFrwrd = 30000;

    public callback: () => any;

    private _id: number = null;

    private maxIntervalId: number = null;

    private isOnInterval = false;

    constructor(attr: EventCtrlAttr) {
        attr = $.extend(true, this.defaults(), attr);
        this.callback = attr.callback;
        this.interval = attr.interval;
        this.pushFrwrd = attr.pushFrwrd;
    }

    /**
     * timeout id of newly created timeout.
     * @param callback any type of function.
     */
    public trigger(callback: () => any): number {
        window.clearTimeout(this._id);
        this.callback = callback;
        this._id = window.setTimeout(this.callbackWrapper.bind(this), this.pushFrwrd);
        if (!this.isOnInterval) {
            this.maxIntervalId = window.setTimeout(this.callbackWrapper.bind(this), this.interval);
            this.isOnInterval = true;
        }
        return this._id;
    }

    /**
     * Wrapper for given callback fnc.
     */
    private callbackWrapper(): void {
        window.clearTimeout(this.maxIntervalId);
        window.clearTimeout(this._id);
        this.maxIntervalId = this._id = null;
        this.isOnInterval = false;
        this.callback();
    }

    /**
     * Return default values for this class.
     */
    private defaults(): KeyValueObj {
        return {
            interval: 10000,
            pushFrwrd: 2000
        };
    }
}

declare type LogType = (message?: any, ...optionalParams: any[]) => void;

/**
 * Common utility functions.
 */
// tslint:disable-next-line:no-namespace
export namespace Utilities {
    export const loadedJsons: { [id: string]: any } = {};
    export const imageData: ImageData[] = [];
    const emptyFunction: LogType = (message?: any, ...optionalParams: any[]) => void 0;

    class Logger {
        public info: LogType = (() => {
            if (ENV === "production") {
                return emptyFunction;
            }
            return (isIE()) ? window.console.log.bind(window.console) : window.console.info.bind(window.console);
        })();
        public warn: LogType = (() => {
            if (ENV === "production") {
                return emptyFunction;
            }
            return (isIE()) ? window.console.log.bind(window.console) : window.console.warn.bind(window.console);
        })();
        public error: LogType = (() => {
            if (ENV === "production") {
                return emptyFunction;
            }
            return (isIE()) ? window.console.log.bind(window.console) : window.console.error.bind(window.console);
        })();
        public table: LogType = (() => {
            if (ENV === "production") {
                return emptyFunction;
            }
            return (typeof window.console.table === "function") ?
                window.console.table.bind(window.console) :
                window.console.log.bind(window.console);
        })();
        public log: LogType = (() => {
            if (ENV === "production") {
                return emptyFunction;
            }
            return window.console.log.bind(window.console);
        })();
        public clear: () => void = window.console.clear.bind(window.console);
    }

    export const argsToArray = (arr: any): any[] => {
        const retArr: any[] = [];
        for (const val of arr) {
            retArr.push(val);
        }
        return retArr;
    };

    export const GetFormattedDate = (date: Date): string => {
        const d: Date = new Date(date);

        let month = "" + (d.getMonth() + 1);
        let day = "" + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) {
            month = "0" + month;
        }
        if (day.length < 2) {
            day = "0" + day;
        }

        return [year, month, day].join("/");
    };

    export const getLocMessage = (moduleId: number, elementId: string, messageId: number = 0, placeholders?: string[]): string => {
        let moduleData: any;
        let elementData: any;
        let messageData: any;
        let message: string;

        switch (moduleId) {
            case LocalizationDataType.common:
                moduleData = LocalizedData.commonLocData;
                break;
            case LocalizationDataType.player:
                moduleData = LocalizedData.playerLocData;

        }

        elementData = moduleData ? _.findWhere(moduleData.elements, {
            id: elementId
        }) : null;

        if (elementData) {
            messageData = _.findWhere(elementData.messages, {
                id: messageId
            });

            message = messageData ? messageData.loc : null;
            message = placeholders ? replaceTextWithPlaceHolders(message, placeholders) : message;
            return message;
        } else {
            Utilities.logger.info("Element " + elementId + "not present in json");
        }
    };

    /**
     * Returns localization text from given Lanuage, ComponentID and ElementID.
     * @param language Language enum type.
     * @param componentID Component's ID.
     * @param elementID Element in Component's ID.
     */
    export const getLocText = (language: Language, componentID: string, elementID: string): string => {
        const labelData = LocalizedData[LocalizationKeyMAP[language]];
        if (labelData && labelData[componentID] && labelData[componentID][elementID]) {
            return labelData[componentID][elementID];
        }
        Utilities.logger.warn("Localization text was not found in ", language, componentID, elementID, "Please Check your loc.json file");
        return "";
    };

    export const getImageSource = (imageId?: string, language?: string): string => {
        let imgData: ImageData[];
        imgData = imageData.filter((data) => data.id == imageId);
        if (imgData.length == 0 && language !== void 0) {
            const imgId = imageId + "_" + language;
            imgData = imageData.filter((data) => data.id == imgId);
        }
        if (imgData[0]) {
            return imgData[0].src;
        } else {
            if (!language) {
                Utilities.logger.warn("[Image Not Found] Image src not found with given ID:", imageId,
                    "Please try language specific image src.");
            } else {
                Utilities.logger.warn("[Image Not Found] Image src not found with given ID:", imageId);
            }
            return null;
        }
    };

    export const getExplorationLocText = (language: Language, elementId: string): string => {
        const data = LocalizedData.explorationLocData[language].localized_data[elementId];
        return data;
    };

    export const replaceTextWithPlaceHolders = (message: string, placeHolders: string[]) => {
        for (const txt of placeHolders) {
            message = message.replace("%@$%", txt);
        }
        return message;
    };

    export const isIPad = (): boolean => {
        const userAgent: string = navigator.userAgent.toLowerCase();
        return userAgent.indexOf("ipad") > -1;
    };

    /**
     * Returns true if its touch device, false otherwise.
     */
    export const isTouchDevice = () => "ontouchstart" in window;

    /**
     * Returns true if safari browser detected.
     */
    export const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    /**
     * Returns if true iPad or iPhone.
     */
    export const isIOS = () => /(iPhone|iPad)/i.test(navigator.userAgent);

    /**
     * Returns true if browser is IE, false otherwise
     */
    export const isIE = () => !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g);

    export const logger = new Logger();

    /**
     * Loads audio file with ajax request.
     * @param strFilePath Audio file path.
     */
    export const loadAudioForAudioContext = (strFilePath: string) =>
        new Promise<AudioBuffer>((resolve, reject) => {
            const audioReq = new XMLHttpRequest();
            audioReq.onreadystatechange = (ev: Event) => {
                if (audioReq.readyState == XMLHttpRequest.DONE) {
                    if (audioReq.status == 200) {
                        initAudio(audioReq.response, resolve, reject);
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

    /**
     * Decodes audio using audio context
     * @param arraybuffer Ajax response of audio file.
     * @param resolve callback function for decoding.
     */
    export const initAudio = (arraybuffer: ArrayBuffer, resolve: (value?: AudioBuffer) => void, reject: (reason?: any) => void) => {
        const audioCtx = SoundManager.getInstance()._context;
        try {
            audioCtx.decodeAudioData(arraybuffer, (decodedData) => {
                resolve(decodedData);
            }, (failedData) => {
                Utilities.logger.warn("Failed in initAudio", failedData);
                reject(failedData);
            });
        } catch (e) {
            reject(e);
        }
    };

    export const getQuestionCollection = () => {
        let questionCollection: any = null;
        if (window.itemsApp && window.itemsApp.questionsApp) {
            const qApp = window.itemsApp.questionsApp();
            const allQs = qApp.questions();
            const qKeys = Object.keys(allQs);
            let isBreak = false;
            for (const qKey of qKeys) {
                const q1 = allQs[qKey];
                for (const key in q1) {
                    if (q1[key] && typeof q1[key] === "function" && q1[key].___boundObject) {
                        const queView = q1[key].___boundObject;
                        questionCollection = queView.model.collection;
                        isBreak = true;
                        break;
                    }
                }
                if (isBreak) {
                    break;
                }
            }
        }
        return questionCollection;
    };

    /**
     * Clear currently loaded lrn question's response data for current user.
     */
    export const clearLrnData = () => {
        const qColl = Utilities.getQuestionCollection();
        for (const model of qColl.models) {
            if (model.attributes.response) {
                switch (model.attributes.response.type) {
                    case "array":
                        const resp = model.attributes.response;
                        resp.value = [];
                        if (resp.responses) {
                            resp.responses = [];
                        }
                        model.set("response", resp);
                        model.state = "modified";
                        model.lastModified = new Date();
                        break;
                    default:
                        logger.warn("[Unknown response type] Unknown response type found in question with type:",
                            model.attributes.response.type);
                }
                logger.log("Model cleared:", model);
            }
        }
        window.itemsApp.save();
    };

    /**
     * Adds disabled attribute and aria-disabled to selected buttons.
     * @param $btn jquery selected button elements.
     */
    export const disableBtn = ($btn: JQuery<HTMLButtonElement>) => {
        $btn.attr("disabled", "disabled").attr("aria-disabled", "true");
    };

    /**
     * Removes disabled attribute and aria-disabled to selected buttons.
     * @param $btn jquery selected button elements.
     */
    export const enableBtn = ($btn: JQuery<HTMLButtonElement>) => {
        $btn.removeAttr("disabled").attr("aria-disabled", "false");
    };

    /**
     * To smoothly scroll to end of parent element with easing
     * @param $parent scrollable parent element with smaller height than content
     * @param speedFactor factor to multiply the original speed
     * @param position optional parameter "bottom"(default) and "top"
     * @author Pratik Das
     */
    export const smoothScrollTo = ($parent: JQuery < HTMLElement >, speedFactor: number, position: "top" | "bottom" = "bottom") => {
        let scrollTo: number;
        let scrollTime: number;
        if (position == "bottom") {
            scrollTo = $parent[0].scrollHeight - $parent.height(); // Bottom poistion of scroll for parent
            scrollTime = (scrollTo - $parent.scrollTop()) * speedFactor;
        } else if (position == "top") {
            scrollTo = 0; // Top poistion of scroll for parent
            scrollTime = $parent.scrollTop() * speedFactor;
        }
        $parent.animate({ scrollTop: (scrollTo) }, scrollTime, "swing");
    };
}

interface CSS3AnimationSupport {
    "fade-out": HTMLElement;
}

// tslint:disable-next-line:no-namespace
export namespace CSS3Animations {
    export const animate = <E extends keyof CSS3AnimationSupport>($elem: JQuery, animationName: E) =>
        new Promise<JQuery.Event<CSS3AnimationSupport[E]>>((res, rej) => {
            $elem.one("webkitAnimationEnd oanimationend msAnimationEnd animationend", res)
                .addClass(animationName);
        });
}

interface CSS3TransitionSupport {
    "fade-out-trans": HTMLElement;
}

// tslint:disable-next-line:no-namespace
export namespace CSS3Transitions {
    export const transit = <E extends keyof CSS3TransitionSupport>($elem: JQuery, transitionName: E) =>
        new Promise<JQuery.Event<CSS3TransitionSupport[E]>>((res, rej) => {
            $elem.one("webkitTransitionEnd mozTransitionEnd MSTransitionEnd transitionend", res)
                .addClass(transitionName);
        });
}

/**
 * Wrapper class for promise.
 */
export class PromiseWrapper<PromiseVal extends any> {
    public promise: Promise<PromiseVal>;
    public resolve: (value?: PromiseVal | PromiseLike<PromiseVal>) => void;
    public reject: (reason?: any) => void;

    constructor() {
        this.promise = new Promise<PromiseVal>((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }

    public then(onfulfilled?: (value?: PromiseVal) => PromiseVal | PromiseLike<PromiseVal>, oncancel?: (reason?: any) => any) {
        return this.promise.then(onfulfilled, oncancel);
    }

    public catch(oncancel?: (reason?: any) => any) {
        return this.promise.catch(oncancel);
    }
}
