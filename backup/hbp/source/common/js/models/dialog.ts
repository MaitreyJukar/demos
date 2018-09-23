import * as Backbone from "backbone";
import * as _ from "underscore";

export interface Attributes {
    hasCloseBtn?: boolean;
    extraClass?: string;
    title?: string;
    titleIcon?: string;
    colorTheme?: string;
    content?: string;
    buttonsData?: ButtonData[];
    state?: eState;
    dismissOnBtnClick?: boolean;
    dialogId?: string;
}

export enum eState {
    HIDDEN,
    SHOWN
}

export interface ButtonData {
    cls?: string;
    id: string;
    label: string;
    icon: string;
    bgColor: string;
    isIconOnLeft?: boolean;
}

export interface ColorThemeTypes {
    NONE: string;
    RED: string;
    [id: string]: string;
}

export const ColorThemes: ColorThemeTypes = {
    NONE: "",
    RED: "red-theme"
};

export class Dialog extends Backbone.Model {
    get title(): string { return (this.get("title")); }
    set title(value: string) { this.set("title", value); }

    get titleIcon(): string { return (this.get("titleIcon")); }
    set titleIcon(value: string) { this.set("titleIcon", value); }

    get colorTheme(): keyof ColorThemeTypes { return (this.get("colorTheme")); }
    set colorTheme(value: keyof ColorThemeTypes) { this.set("colorTheme", value); }

    get content(): string { return (this.get("content")); }
    set content(value: string) { this.set("content", value); }

    get extraClass(): string { return (this.get("extraClass")); }
    set extraClass(value: string) { this.set("extraClass", value); }

    get buttonsData(): ButtonData[] { return (this.get("buttonsData")); }
    set buttonsData(value: ButtonData[]) { this.set("buttonsData", value); }

    get state(): eState { return (this.get("state")); }
    set state(value: eState) { this.set("state", value); }

    get dismissOnBtnClick(): boolean { return (this.get("dismissOnBtnClick")); }
    set dismissOnBtnClick(value: boolean) { this.set("dismissOnBtnClick", value); }

    get hasCloseBtn(): boolean { return (this.get("hasCloseBtn")); }
    set hasCloseBtn(value: boolean) { this.set("hasCloseBtn", value); }

    get dialogId(): string { return (this.get("dialogId")); }
    set dialogId(value: string) { this.set("dialogId", value); }

    constructor(attr?: any) {
        super(attr);
        this.listenTo(this, "change:state", this.resetStateBoolean);
        this.resetStateBoolean()
            .initBtns();
    }

    public defaults() {
        return {
            buttonsData: [] as ButtonData[],
            colorTheme: "",
            content: "",
            dialogId: _.uniqueId("dialog-"),
            dismissOnBtnClick: false,
            extraClass: "",
            hasCloseBtn: true,
            state: eState.HIDDEN,
            title: "",
            titleIcon: "icon-help"
        };
    }

    public resetStateBoolean() {
        this.set("_shown", this.state === eState.SHOWN);
        return this;
    }

    /**
     * Initializes available buttons.
     * Sets isIconOnLeft to true if its undefined.
     */
    private initBtns() {
        for (let i = 0; i < this.buttonsData.length; i++) {
            if (this.buttonsData[i].isIconOnLeft === void 0) {
                this.buttonsData[i].isIconOnLeft = true;
            }
        }
    }
}