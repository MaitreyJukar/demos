import * as Backbone from "backbone";
import * as _ from "underscore";

export enum eState {
    HIDDEN,
    SHOWN
}

export interface Attributes {
    hasCloseBtn?: boolean;
    text?: string;
    textColor?: string;
    pretextIcon?: string;
    buttonsData?: ButtonData[];
    state?: eState;
    dismissOnBtnClick?: boolean;
    popupId?: string;
}

export interface ButtonData {
    cls?: string;
    id: string;
    label: string;
    icon: string;
    bgColor: string;
    isIconOnLeft?: boolean;
}

export class Popup extends Backbone.Model {
    public static eState = eState;

    get hasCloseBtn(): boolean { return (this.get("hasCloseBtn")); }
    set hasCloseBtn(value: boolean) { this.set("hasCloseBtn", value); }

    get text(): string { return (this.get("text")); }
    set text(value: string) { this.set("text", value); }

    get pretextIcon(): string { return (this.get("pretextIcon")); }
    set pretextIcon(value: string) { this.set("pretextIcon", value); }

    get buttonsData(): ButtonData[] { return (this.get("buttonsData")); }
    set buttonsData(value: ButtonData[]) { this.set("buttonsData", value); }

    get state(): eState { return (this.get("state")); }
    set state(value: eState) { this.set("state", value); }

    get dismissOnBtnClick(): boolean { return (this.get("dismissOnBtnClick")); }
    set dismissOnBtnClick(value: boolean) { this.set("dismissOnBtnClick", value); }

    get textColor(): string { return (this.get("textColor")); }
    set textColor(value: string) { this.set("textColor", value); }

    get popupId(): string { return (this.get("popupId")); }
    set popupId(value: string) { this.set("popupId", value); }

    constructor(attr?: any) {
        super(attr);
        this.listenTo(this, "change:pretextIcon", this.resetTextIconBoolean);
        this.listenTo(this, "change:state", this.resetStateBoolean);
        this.resetTextIconBoolean()
            .resetStateBoolean()
            .initBtns();
    }

    public defaults() {
        return {
            popupId: _.uniqueId("popup-"),
            // tslint:disable-next-line:object-literal-sort-keys
            dismissOnBtnClick: false,
            hasCloseBtn: true,
            text: "",
            pretextIcon: "",
            buttonsData: [] as ButtonData[],
            state: eState.HIDDEN,
            _hasTextIcon: false,
            textColor: "#50812c"
        };
    }

    public resetTextIconBoolean() {
        if (this.pretextIcon === "") {
            this.set("_hasTextIcon", false);
        } else {
            this.set("_hasTextIcon", true);
        }
        return this;
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
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.buttonsData.length; i++) {
            if (this.buttonsData[i].isIconOnLeft === void 0) {
                this.buttonsData[i].isIconOnLeft = true;
            }
        }
    }
}
