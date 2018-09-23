import * as Backbone from "backbone";
import PlayerModel from "./player-model";
import SideMenuCollection from "../collections/side-menu";
import MenuModel from "./item-model";
import PlayerView from "./../views/player";
import * as Handlebars from "handlebars";
import * as _ from "underscore";
declare const cb: number;

export declare class PanelDataList {
    term: string;
    text: string;
}

export enum eState {
    SHOWN,
    HIDDEN
}

export enum eTemplateType {
    ALPHA_LIST,
    DELETABLE_LIST
}

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;

export class PanelModel<TList> extends Backbone.Model {
    get title(): string { return (this.get("title")); }
    set title(value: string) { this.set("title", value); }

    get icon(): string { return (this.get("icon")); }
    set icon(value: string) { this.set("icon", value); }

    get list(): TList[] { return (this.get("list")); }
    set list(value: TList[]) { this.set("list", value); }

    get panelId(): number { return (this.get("panelId")); }
    set panelId(value: number) { this.set("panelId", value); }

    get state(): eState { return (this.get("state")); }
    set state(value: eState) { this.set("state", value); }

    get templateType(): eTemplateType { return (this.get("templateType")); }
    set templateType(value: eTemplateType) { this.set("templateType", value); }

    get templateFnc(): HandlebarsTpl { return (this.get("templateFnc")); }
    set templateFnc(value: HandlebarsTpl) { this.set("templateFnc", value); }

    get searchPlaceholderText(): string { return (this.get("searchPlaceholderText")); }
    set searchPlaceholderText(value: string) { this.set("searchPlaceholderText", value); }

    get searchAccText(): string { return (this.get("searchAccText")); }
    set searchAccText(value: string) { this.set("searchAccText", value); }

    get searchBtnAccText(): string { return (this.get("searchBtnAccText")); }
    set searchBtnAccText(value: string) { this.set("searchBtnAccText", value); }

    get closeBtnAccText(): string { return (this.get("closeBtnAccText")); }
    set closeBtnAccText(value: string) { this.set("closeBtnAccText", value); }

    constructor(attr?: any) {
        super(attr);
    }

    defaults(): Backbone.ObjectHash {
        return {
            "title": "Glossary",
            "icon": "glossary",
            "list": [] as TList[],
            "panelId": Number(_.uniqueId()),
            "state": eState.HIDDEN,
            "templateType": eTemplateType.ALPHA_LIST,
            "searchPlaceholderText": "Search",
            "searchAccText": "Search",
            "searchBtnAccText": "Search",
            "closeBtnAccText": "Close",
            "templateFnc": () => { }
        };
    }

    url = function () {
        return 'content/' + PlayerView.Instance.model.appName + '/json/glossary.json?cb=' + cb;
    }
}