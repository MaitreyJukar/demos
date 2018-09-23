import * as Backbone from "backbone";
import * as _ from "underscore";

export class GeometryToolAttributes {
    public toolsBtnData?: any;
    public popUpData?: any;
}

export class GeometryTool extends Backbone.Model {

    constructor(attr: GeometryToolAttributes) {
        super(attr);
    }

    get toolsBtnData(): any {
        return this.get("toolsBtnData");
    }

    set toolsBtnData(toolsBtnData: any) {
        this.set("toolsBtnData", toolsBtnData);
    }
    get popUpData(): any {
        return this.get("popUpData");
    }

    set popUpData(popUpData: any) {
        this.set("popUpData", popUpData);
    }

    public defaults() {
        return {
            popUpData: {},
            toolsBtnData: {}
        };
    }
}
