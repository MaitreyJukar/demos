import * as Backbone from "backbone";
import SideMenuCollection from "../collections/side-menu";
import { MenuItemChunk } from "../views/side-menu";
import ItemModel from "../models/item-model";
import Player from "./../views/player";

export default class BreadcrumbsModel extends Backbone.Model {
    get linksCollection(): SideMenuCollection { return Player._instance.model.sideMenuCollection; }

    get activeModel(): ItemModel { return Player._instance.model.activeModel; }
    set activeModel(value: ItemModel) { Player._instance.model.activeModel = value; }

    initialize() { }

    parse(data: string) {
        return {
            item: data
        };
    }
}