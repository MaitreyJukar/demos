import * as Backbone from "backbone";
import PlayerModel from "./player-model";
import SideMenuCollection from "../collections/side-menu";
import MenuModel from "./item-model";
import PlayerView from "./../views/player";
import * as Handlebars from "handlebars";

export declare class MenuItem {
    tagName?: string; // iconic-text's top level tag name, currently avaialable `div` and `a`.
    targetLink?: string; // iconic-text's a tag's target link.
    hasValidLink?: boolean; // boolean for iconic-text's a tag's target link is valid or not.
    itemType: string; // iconic-text / button-group
    text: string; // for iconic text / button group's text.
    icon?: string; // for iconic text's icon (font awesome icon).
    percent?: number; // % progress of button group's progress.
    percentChange?: number; // % progress change factor of button group's percent.
    class?: string; // iconic-text class
    accText?: string; // iconic-text's accessibility text.
}

export enum eState {
    SHOWN,
    HIDDEN
}

export class HeaderMenuModel extends Backbone.Model {
    get items(): MenuItem[] { return (this.get("items")); }
    set items(value: MenuItem[]) { this.set("items", value); }
    
    get state(): eState { return (this.get("state")); }
    set state(value: eState) { this.set("state", value); }

    constructor(attr?: any) {
        super(attr);
    }

    defaults() {
        return {
            items: [] as MenuItem[],
            state: eState.HIDDEN
        };
    }
}