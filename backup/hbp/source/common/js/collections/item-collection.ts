import * as Backbone from "backbone";
import ItemModel from "../models/item-model";

export default class ItemCollection extends Backbone.Collection<Backbone.Model> {
    models: ItemModel[];

    get totalPages(): number { return (this.models.reduce((a, b: ItemModel) => a + b.totalPages, 0)); }

    get visitedPages(): number { return (this.models.reduce((a, b: ItemModel) => a + b.visitedPages, 0)); }

    constructor(attr?: any[]) {
        if (attr && attr.length) {
            for (let i = 0; i < attr.length; i++) {
                attr[i] = new ItemModel(attr[i]);
            }
        }
        super(attr);
    }
    defaults() {
        return {
            "visitedPages": 0
        };
    }

}