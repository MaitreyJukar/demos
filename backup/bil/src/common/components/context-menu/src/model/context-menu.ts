import * as Backbone from "backbone";
import * as _ from "underscore";

export enum ModelType {
    DELETE,
    MOVE
}

export class ContextMenuModel extends Backbone.Model {
    get label(): string { return this.get("label"); }
    set label(value: string) { this.set("label", value); }

    get val(): string { return this.get("val"); }
    set val(value: string) { this.set("val", value); }

    constructor(attr?: any, opts?: any) {
        super(attr, opts);
    }
}
