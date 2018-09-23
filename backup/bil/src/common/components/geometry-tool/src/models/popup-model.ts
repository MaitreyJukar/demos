import * as Backbone from "backbone";

export class Popup extends Backbone.Model {

    public jsonData = require("../../data/json/data.json");
    constructor(attr: PopupAttributes) {
        super(attr);
        this.jsonData = $.extend(true, this.jsonData, attr);
        return;
    }

    get popUpData(): any {
        return this.get("popUpData");
    }

    set popUpData(popUpData: any) {
        this.set("popUpData", popUpData);
    }
}

export class PopupAttributes {
    public popUpData?: any;
}
