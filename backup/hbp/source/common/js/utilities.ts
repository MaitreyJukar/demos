interface ExtWindow extends Window {
    cb: number;
    AudioContext: {
        prototype: AudioContext;
        new(): AudioContext;
    };
    webkitAudioContext: {
        prototype: AudioContext;
        new(): AudioContext;
    };
}

declare const window: ExtWindow;

export namespace Utilities {
    /**
     * Returns true if browser is IE, false otherwise
     */
    export const isIE = () => {
        return !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g);
    };

    /**
     * Returns if true iPad or iPhone.
     */
    export const isIOS = () => {
        return /(iPhone|iPad)/i.test(navigator.userAgent);
    };

    /**
     * Returns true if safari browser detected.
     */
    export const isSafari = () => {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    };

    /**
     * Returns true if its touch device, false otherwise.
     */
    export const isTouchDevice = () => {
        return 'ontouchstart' in window;
    };

    /**
     * Manages Browser Fullscreen calls.
     * @supports 4 Browsers (Tested on Chrome, Firefox, IE, Edge).
     * @static_class A static class. Use methods / properties directly.
     */
    export class FullScreenManager {
        private static _isFullscreen: boolean = false;
        private static _isAttached: boolean = false;

        constructor() {
            console.error("Please use methods and member directly without creating any instance i.e. 'FullScreenManager.isFullscreen' or 'FullScreenManager.gotoFullScreen()'");
        }

        /**
         * Returns true if browser is currently in fullscreen otherwise false.
         */
        public static get isFullscreen(): boolean {
            if (Utilities.isIE()) {
                return FullScreenManager._isFullscreen;
            }
            const doc: any = document;
            if (doc.fullscreen || doc.webkitIsFullScreen || doc.mozFullScreen) {
                return true;
            } else if (!(doc.fullscreen && doc.webkitIsFullScreen && doc.mozFullScreen)) {
                return false;
            }
            return doc.fullscreen || doc.webkitIsFullScreen || doc.mozFullScreen;
        }

        /**
         * Switches screen to fullscreen. (Only if its not)
         */
        public static gotoFullScreen() {
            if (!FullScreenManager.isFullscreen) {
                let el: any = document.documentElement,
                    rfs = el.requestFullscreen
                        || el.webkitRequestFullScreen
                        || el.mozRequestFullScreen
                        || el.msRequestFullscreen;
                if (rfs) {
                    rfs.call(el);
                } else {
                    console.warn("Unable to switch to FullScreen: Your browser does not support requestFullscreen call.");
                }
            }
        }

        /**
         * Exits fullscreen. (Only if it is fullscreen)
         */
        public static exitFullScreen() {
            if (FullScreenManager.isFullscreen) {
                let el: any = document,
                    rfs = el.exitFullscreen
                        || el.msExitFullscreen
                        || el.mozCancelFullScreen
                        || el.webkitExitFullscreen;
                if (rfs) {
                    rfs.call(el);
                } else {
                    console.warn("Unable to exit FullScreen: Your browser does not support exitFullscreen call.");
                }
            }
        }

        /**
         * Attaches fullscreen change event listener to document.
         * @param callback event callback.
         * @param useCapture Optional. A Boolean value that specifies the event phase to remove the event handler from.
         */
        public static attachChangeListener(callback: (this: Document, ev: Event) => any, useCapture = false) {
            document.addEventListener('webkitfullscreenchange', callback, useCapture);
            document.addEventListener('mozfullscreenchange', callback, useCapture);
            document.addEventListener('fullscreenchange', callback, useCapture);
            document.addEventListener('MSFullscreenChange', callback, useCapture);
        }

        /**
         * Removes attached fullscreen change event listener to document.
         * @param callback event callback.
         * @param useCapture Optional. A Boolean value that specifies the event phase to remove the event handler from.
         */
        public static removeChangeListener(callback: (this: Document, ev: Event) => any, useCapture = false) {
            document.removeEventListener('webkitfullscreenchange', callback, useCapture);
            document.removeEventListener('mozfullscreenchange', callback, useCapture);
            document.removeEventListener('fullscreenchange', callback, useCapture);
            document.removeEventListener('MSFullscreenChange', callback, useCapture);
        }

        /**
         * Adds private change listener for IE.
         * Changes private member _isFullscreen on fullscreen changes.
         */
        public static _addPrivateListener() {
            if (Utilities.FullScreenManager._isAttached) {
                console.warn("Private listener already attached!");
                return;
            }
            Utilities.FullScreenManager.attachChangeListener(() => {
                Utilities.FullScreenManager._isFullscreen = !Utilities.FullScreenManager._isFullscreen;
            });
            Utilities.FullScreenManager._isAttached = true;
        }
    }

    /**
     * Custom Enum class.
     * @extends array of string
     * @imp_note Do not push string names that are similar to native array functions such as push, pop etc. as cuch functions will fail to execute.
     * @notes only pop and push funcions are overriden, add more functions if needed.
     */
    export class ExtEnum extends Array<string> {
        [id: string]: any;

        constructor(attr: string[] = []) {
            super();
            Object.setPrototypeOf(this, ExtEnum.prototype);
            const newArr: string[] = JSON.parse(JSON.stringify(attr));
            for (let i = 0; i < newArr.length; i++) {
                const item = newArr[i];
                this.push(item);
                this[this[i]] = i;
            }
        }

        /**
         * Appends new elements to an ExtEnum, and returns the new length of the ExtEnum.
         * @param items New elements of the Array.
         */
        public push(...items: string[]) {
            const ret = super.push(...items);
            this.generateAttrs();
            return ret;
        }

        /**
         * Removes the last element from an ExtEnum and returns it.
         */
        public pop() {
            const ret = super.pop();
            this.generateAttrs();
            return ret;
        }

        /**
         * Generates string ids as properties.
         */
        private generateAttrs() {
            for (let i = 0; i < this.length; i++) {
                this[this[i]] = i;
            }
        }
    }


    /**
     * Adds disabled attribute and aria-disabled to selected buttons.
     * @param $btn jquery selected button elements.
     */
    export const disableBtn = ($btn: JQuery<HTMLButtonElement>) => {
        $btn.attr("disabled", "disabled").attr("aria-disabled", "true");
    }

    /**
     * Removes disabled attribute and aria-disabled to selected buttons.
     * @param $btn jquery selected button elements.
     */
    export const enableBtn = ($btn: JQuery<HTMLButtonElement>) => {
        $btn.removeAttr("disabled").attr("aria-disabled", "false");
    }

    /**
     * Sets matched metas.
     * @example Utilities.setMeta({ "viewport": { "user-scalable": "no" } });
     * @param attrs Attributes to set.
     * @param options Optional, contains window.
     */
    export const setMeta = (attrs: { [id: string]: { [id: string]: string } }, options: { win?: Window } = {}) => {
        if (options.win === void 0) { options.win = window; }

        for (const key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                for (const key2 in attrs[key]) {
                    if (attrs[key].hasOwnProperty(key2)) {
                        setMetaTagContent(key, key2, attrs[key][key2], options.win);
                    }
                }
            }
        }
    }

    /**
     * Sets selectable metatag's content with given contentname and value.
     * @param tagName meta tag's name attribute.
     * @param contentName content attributes key name.
     * @param value content attr's key's value.
     * @param win context window, Optional.
     */
    const setMetaTagContent = (tagName: string, contentName: string, value: string, win: Window = window) => {
        const $meta = $(win.document).find("meta[name=" + tagName + "]");
        const content = $meta.attr("content");
        const props = content.split(",");
        const replaceRegex = /([^]*)(\=)([^]*)/g;
        let found = false;

        for (let i = 0; i < props.length; i++) {
            props[i] = props[i].trim();
            if (props[i].split("=")[0] === contentName) {
                props[i] = props[i].replace(replaceRegex, "$1$2" + value);
                found = true;
            }
        }
        if (!found) {
            props.push(contentName + "=" + value);
        }
        $meta.attr("content", props.join(", "));
        console.info($meta.attr("content"));
    }

    /**
     * Trims white spaces tabs between two nodes in a template string.
     * @param tpl valid html template string
     */
    export const trimSpacesFromTemplate = (tpl: string) => {
        return tpl.replace(/>[\s]*</g, "><");
    };

    /**
     * Returns next or previous focusable element.
     * @param $elems focusable element list.
     * @param $elem focused element or current element.
     * @param isNext Indicates whether to focus next element or previous, next if true, otherwise false.
     */
    export const getFocusableElement = ($elems: JQuery<HTMLElement>, $elem: JQuery<HTMLElement>, isNext = true) => {
        if ($elems === void 0) { console.warn("[Wrong Invocation] 'getNextFocusableElement' method need 2 parameters"); }
        if ($elem.length !== 1) { console.warn("[Wrong Invocation] 2nd Param in 'getNextFocusableElement' method must have 1 elem"); }
        let offset = -1;
        if (isNext) {
            offset = 1;
        }
        let elemIndex = -1;
        $elems.each((index, elem) => {
            if ($elem.get(0) === elem) {
                elemIndex = index + offset;
                return false;
            }
        });
        if (elemIndex !== -1 && $elems.get(elemIndex) !== void 0) {
            return $elems.eq(elemIndex);
        }
    };

    /**
     * Sets page title as provided. Returns updated $title.
     * @param title Any string, if invlid passed, false value will be returned.
     */
    export const setPageTitle = (title: string) => {
        if (!title) { console.warn("[Missing Title] No webpage title found in JSON:", location.hash); return false; }
        return $("head title").text(title);
    };

    /**
     * Refocuses the given element by blurring it first, then shift focus on body / other element and then refocus given element.
     * @param elem Element to be focused.
     * @param focusOtherElem Whether to focus other element or not (in some cases simply blurring and focusing the element is not enough to re-focus element).
     */
    export const reFocusElement = (elem: HTMLElement, focusOtherElem = false) => {
        let blurringSelector = "body";
        if (elem === $(blurringSelector).get(0)) {
            blurringSelector = "[tabindex=0]:visible, button:visible, a:visible";
        }

        $(elem).blur();
        if (focusOtherElem) {
            $(blurringSelector).eq(0).focus();
        }
        $(elem).focus();
    };

    export const getMobileDeviceType = () => {
        const currWin: any = window;
        const userAgent = navigator.userAgent || navigator.vendor || currWin.opera;

        if (/windows phone/i.test(userAgent)) {
            return "Windows Phone";
        }

        if (/android/i.test(userAgent)) {
            return "Android";
        }

        if (/iPad|iPhone|iPod/.test(userAgent) && !currWin.MSStream) {
            return "iOS";
        }

        return "unknown";
    };

    /**
     * Prevents default & stop immediate and normal propogation.
     * @param eve Any event object.
     */
    export const stopEvePropogation = (eve?: any) => {
        eve && eve.preventDefault && typeof eve.preventDefault === "function" && eve.preventDefault();
        eve && eve.stopPropagation && typeof eve.stopPropagation === "function" && eve.stopPropagation();
        eve && eve.stopImmediatePropagation && typeof eve.stopImmediatePropagation === "function" && eve.stopImmediatePropagation();
    };

    let audioCtx: AudioContext;

    /**
     * Returns instance of audio context if supports otherwise null.
     */
    export const getAudioContext: () => AudioContext = () => {
        let AudioCtxCtor = window.AudioContext || window.webkitAudioContext;

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
            let buffer: AudioBuffer = audioCtx.createBuffer(1, 1, 44100);
            let ctxHack: AudioBufferSourceNode = audioCtx.createBufferSource()
            ctxHack.buffer = buffer
            ctxHack.connect(audioCtx.destination)
            ctxHack.start(0)
            ctxHack.disconnect()

            audioCtx.close() // dispose old context
            audioCtx = new AudioCtxCtor()
        }

        return audioCtx;
    }

    /**
     * Loads audio file with ajax request.
     * @param strFilePath Audio file path.
     */
    export const loadAudioForAudioContext = (strFilePath: string) => {
        return new Promise<AudioBuffer>((resolve, reject) => {
            const audioReq = new XMLHttpRequest();
            audioReq.onreadystatechange = (ev: Event) => {
                if (audioReq.readyState == XMLHttpRequest.DONE) {
                    if (audioReq.status == 200) {
                        initAudio(audioReq.response, resolve, reject);
                    }
                    else {
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
    export const initAudio = (arraybuffer: ArrayBuffer, resolve: (value?: AudioBuffer) => void, reject: (reason?: any) => void) => {
        audioCtx.decodeAudioData(arraybuffer, (decodedData) => {
            resolve(decodedData);
        }, (failedData) => {
            console.warn("Failed in initAudio", failedData);
            reject(failedData);
        });
    }
}

Utilities.FullScreenManager._addPrivateListener();