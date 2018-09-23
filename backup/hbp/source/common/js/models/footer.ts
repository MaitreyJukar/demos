import * as Backbone from "backbone";
import SideMenuCollection from "../collections/side-menu";
import { MenuItemChunk } from "../views/side-menu";
import ItemModel from "../models/item-model";
import Player from "./../views/player";

export default class FooterModel extends Backbone.Model {
    get linksCollection(): SideMenuCollection { return Player._instance.model.sideMenuCollection; }

    get activeModel(): ItemModel { return Player._instance.model.activeModel; }
    set activeModel(value: ItemModel) { Player._instance.model.activeModel = value; }

    get current(): number { return this.get("current"); }
    set current(value: number) { this.set("current", value); }

    get max(): number { return this.get("max"); }
    set max(value: number) { this.set("max", value); }

    get leftLink(): string { return this.get("leftLink"); }
    set leftLink(value: string) { this.set("leftLink", value); }

    get rightLink(): string { return this.get("rightLink"); }
    set rightLink(value: string) { this.set("rightLink", value); }

    get isShowCenter(): boolean { return this.get("isShowCenter"); }
    set isShowCenter(value: boolean) { this.set("isShowCenter", value); }

    get currLabel(): string { return this.get("currLabel"); }
    set currLabel(value: string) { this.set("currLabel", value); }

    get nextLabel(): string { return this.get("nextLabel"); }
    set nextLabel(value: string) { this.set("nextLabel", value); }

    get prevLabel(): string { return this.get("prevLabel"); }
    set prevLabel(value: string) { this.set("prevLabel", value); }

    get prevLinkText(): string { return this.get("prevLinkText"); }
    set prevLinkText(value: string) { this.set("prevLinkText", value); }

    get nextLinkText(): string { return this.get("nextLinkText"); }
    set nextLinkText(value: string) { this.set("nextLinkText", value); }

    get nextLinkIndex(): number { return this.get("nextLinkIndex"); }
    set nextLinkIndex(value: number) { this.set("nextLinkIndex", value); }

    get prevLinkIndex(): number { return this.get("prevLinkIndex"); }
    set prevLinkIndex(value: number) { this.set("prevLinkIndex", value); }

    constructor(attr?: any) {
        super(attr);
    }

    defaults(): Backbone.ObjectHash {
        return {
            current: 1,
            max: 1,
            leftLink: "#",
            rightLink: "#",
            isShowCenter: true,
            nextLabel: "",
            prevLabel: "",
            currLabel: ""
        };
    }
}