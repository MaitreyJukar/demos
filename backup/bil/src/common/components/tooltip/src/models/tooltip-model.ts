import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";
import * as Utilities from "./../../../../../common/helper/utilities";
import CommonUtilities = Utilities;

export enum State {
    HIDE,
    SHOW
}

export enum Position {
    top,
    right,
    bottom,
    left
}

// tslint:disable-next-line:no-namespace
export namespace EVENTS {
    export const PLAY = "PLAY";
    export const PAUSE = "PAUSE";
    export const MUTE = "MUTE";
    export const UNMUTE = "UNMUTE";
    export const STOP = "STOP";
}

export declare class InfoImage {
    public altText?: string;
    public cssClass?: string;
    public imgID?: string;
}

export interface Attributes {
    state?: State;
    title?: string;
    content?: string;
    postImgContent?: string;
    image?: InfoImage;
    position?: string;
    modelId: string;
    audioID: string;
}

export class ToolTip extends Backbone.Model {
    get state(): State { return this.get("state"); }
    set state(value: State) { this.set("state", value); }

    get title(): string { return this.get("title"); }
    set title(value: string) { this.set("title", value); }

    get content(): string { return this.get("content"); }
    set content(value: string) { this.set("content", value); }

    get postImgContent(): string { return this.get("postImgContent"); }
    set postImgContent(value: string) { this.set("postImgContent", value); }

    get image(): InfoImage { return this.get("image"); }
    set image(value: InfoImage) { this.set("image", value); }

    get position(): string { return this.get("position"); }
    set position(value: string) { this.set("position", value); }

    get modelId(): string { return this.get("modelId"); }
    set modelId(value: string) { this.set("modelId", value); }

    get imgSrc(): string { return this.get("imgSrc"); }
    set imgSrc(value: string) { this.set("imgSrc", value); }

    get audioID(): string { return this.get("audioID"); }
    set audioID(value: string) { this.set("audioID", value); }

    get currentLanguage(): Utilities.Language { return this.get("currentLanguage"); }
    set currentLanguage(value: Utilities.Language) { this.set("currentLanguage", value); }

    get locTextData(): { [id: string]: string } { return this.get("locTextData"); }
    set locTextData(value: { [id: string]: string }) { this.set("locTextData", value); }

    constructor(attr?: any, opts?: any) {
        super(attr, opts);
        this.currentLanguage = opts;
        if (this.image.imgID) {
            const imgSrc = Utilities.Utilities.getImageSource(this.image.imgID);
            // Use language specific image when common is not found..
            this.imgSrc = (imgSrc) ? imgSrc : Utilities.Utilities.getImageSource(this.image.imgID, this.currentLanguage);
        }
    }

    public defaults() {
        return {
            content: "",
            image: {},
            imgSrc: "",
            modelId: _.uniqueId("tooltip-"),
            position: Position[1],
            postImgContent: "",
            state: State.HIDE,
            title: ""
        };
    }

    public toggleState() {
        this.state = (this.state == State.HIDE) ? this.state = State.SHOW : this.state = State.HIDE;
    }

    public setTooltipLocText(): any {
        const selectedLanguage = this.currentLanguage;
        const getLocText = CommonUtilities.Utilities.getLocText;
        const componentId = "tooltip";

        this.locTextData = {
            pauseBtnAria: getLocText(selectedLanguage, componentId, "pause-button"),
            playBtnAria: getLocText(selectedLanguage, componentId, "play-button")
        };
    }
}
