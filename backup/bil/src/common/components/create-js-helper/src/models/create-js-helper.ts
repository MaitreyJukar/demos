import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";
import * as Utilities from "./../../../../helper/utilities";
import CommonUtilities = Utilities;

export interface Animation {
    id: string;
    exportFunction: string;
}

export interface AnimationData {
    [id: string]: Animation;
}

export class CreateJSHelper extends Backbone.Model {
    get animationData(): AnimationData { return this.get("animationData"); }
    set animationData(value: AnimationData) { this.set("animationData", value); }

    constructor(attr?: any) {
        super(attr);
    }
}
