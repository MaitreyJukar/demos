import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";
import CommonUtilities = Utilities;
import * as Utilities from "./../../../../../common/helper/utilities";

/**
 * Footer types enum class
 */
export enum FooterTypes {
    multi
}

export declare class FooterModelAttr {
    public type?: FooterTypes;
    public locTextData?: any;
    public audioID?: string;
    public languages?: Utilities.Language;
    public lang?: Utilities.Language;
    public languagesAvailable?: string[];
    public enableDoneOnAudioEnd?: boolean;
    public validateLastQuestion?: boolean;
}

// tslint:disable-next-line:no-namespace
export namespace EVENTS {
    export const PLAY = "PLAY";
    export const PAUSE = "PAUSE";
    export const MUTE = "MUTE";
    export const UNMUTE = "UNMUTE";
    export const SHOW_CAPTION = "SHOW_CAPTION";
    export const HIDE_CAPTION = "HIDE_CAPTION";
    export const CHANGE_LANG = "CHANGE_LANG";
    export const LANG_NA = "LANG_NOT_AVAILABLE";
    export const REFRESH = "REFRESH";
    export const NEXT = "NEXT";
    export const DONE = "DONE";
    export const STOP = "STOP";
}

export class FooterModel extends Backbone.Model {

    get currentLanguage(): Utilities.Language { return this.get("currentLanguage"); }
    set currentLanguage(value: Utilities.Language) { this.set("currentLanguage", value); }

    get audioID(): string { return this.get("audioID"); }
    set audioID(value: string) { this.set("audioID", value); }

    get questions(): string { return this.get("questions"); }
    set questions(value: string) { this.set("questions", value); }

    get type(): FooterTypes { return this.get("type"); }
    set type(value: FooterTypes) { this.set("type", value); }

    get locTextData(): { [id: string]: string } { return this.get("locTextData"); }
    set locTextData(value: { [id: string]: string }) { this.set("locTextData", value); }

    get languages(): typeof Utilities.Language { return this.get("languages"); }
    set languages(value: typeof Utilities.Language) { this.set("languages", value); }

    get languagesAvailable(): string[] { return this.get("languagesAvailable"); }
    set languagesAvailable(value: string[]) { this.set("languagesAvailable", value); }

    get lastQuestionReached(): boolean { return this.get("lastQuestionReached"); }
    set lastQuestionReached(value: boolean) { this.set("lastQuestionReached", value); }

    get lastQuestionUpdated(): boolean { return this.get("lastQuestionUpdated"); }
    set lastQuestionUpdated(value: boolean) { this.set("lastQuestionUpdated", value); }

    get lastAudioEnded(): boolean { return this.get("lastAudioEnded"); }
    set lastAudioEnded(value: boolean) { this.set("lastAudioEnded", value); }

    get enableDoneOnAudioEnd(): boolean { return this.get("enableDoneOnAudioEnd"); }
    set enableDoneOnAudioEnd(value: boolean) { this.set("enableDoneOnAudioEnd", value); }

    get validateLastQuestion(): boolean { return this.get("validateLastQuestion"); }
    set validateLastQuestion(value: boolean) { this.set("validateLastQuestion", value); }

    get explorationComplete(): boolean { return this.get("explorationComplete"); }
    set explorationComplete(value: boolean) { this.set("explorationComplete", value); }

    get lastQuestionValidated(): boolean { return this.get("lastQuestionValidated"); }
    set lastQuestionValidated(value: boolean) { this.set("lastQuestionValidated", value); }

    constructor(attr?: FooterModelAttr, opts?: any) {
        super(attr, opts);
        this.currentLanguage = attr.lang;
        this.type = attr.type;
        this.languages = Utilities.Language;
        this.languagesAvailable = attr.languagesAvailable;
    }
    public selectedLangugae(): any {
        return $("#english").html();
    }
    public setFooterLocText(): any {
        const selectedLanguage = this.currentLanguage;
        const getLocText = CommonUtilities.Utilities.getLocText;
        const componentId = "footer";

        this.locTextData = {
            capsHideBtnAria: getLocText(selectedLanguage, componentId, "caption-hide-button"),
            capsShowBtnAria: getLocText(selectedLanguage, componentId, "caption-show-button"),
            engText: getLocText(selectedLanguage, componentId, "lang-text-english"),
            muteBtnAria: getLocText(selectedLanguage, componentId, "mute-button"),
            nextBtnText: getLocText(selectedLanguage, componentId, "next-button"),
            pauseBtnAria: getLocText(selectedLanguage, componentId, "pause-button"),
            playBtnAria: getLocText(selectedLanguage, componentId, "play-button"),
            resetAllBtnAria: getLocText(selectedLanguage, componentId, "reset-all-button"),
            showAllBtnAria: getLocText(selectedLanguage, componentId, "show-all-button"),
            spanishText: getLocText(selectedLanguage, componentId, "lang-text-spanish"),
            unmuteBtnAria: getLocText(selectedLanguage, componentId, "unmute-button")
        };
    }
}
