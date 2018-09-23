import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";

export declare class NumberLineAttributes {
    public disabled?: boolean;
    public savedData?: any;
    public saveDataType?: string;
    public validationType?: string;
}

export const SAVE_DATA_TYPES = {
    BASIC: "basic",
    CUSTOM: "custom",
    LRN: "lrn-answers"
};

export const VALIDATION_TYPES = {
    BETWEEN: "between",
    EQUAL: "equal",
    GREATERTHAN: "greaterThan",
    LESSTHAN: "lessThan"
};

export class NumberLine extends Backbone.Model {
    constructor(attr: NumberLineAttributes) {
        super(attr);
    }

    get validationType(): string { return this.get("validationType"); }

    get saveDataType(): string { return this.get("saveDataType"); }

    get fetchDataType(): string { return this.get("fetchDataType"); }

    get disabled(): boolean { return this.get("disabled"); }

    get savedData(): any { return this.get("savedData"); }

    get saveDataFn(): string { return this.get("saveDataFn"); }

    get fetchDataFn(): string { return this.get("fetchDataFn"); }

    get validationFn(): string { return this.get("validationFn"); }

    get showAnswerFn(): string { return this.get("showAnswerFn"); }

    get startPoint(): number { return this.get("startPoint"); }
    set startPoint(value: number) { this.set("startPoint", value); }

    get endPoint(): number { return this.get("endPoint"); }
    set endPoint(value: number) { this.set("endPoint", value); }

    get tickRange(): number { return this.get("tickRange"); }
    set tickRange(value: number) { this.set("tickRange", value); }

    get width(): number { return this.get("width"); }
    set width(value: number) { this.set("width", value); }

    get maxPoints(): number { return this.get("maxPoints"); }
    set maxPoints(value: number) { this.set("maxPoints", value); }

    get placedPoints(): any { return this.get("placedPoints"); }
    set placedPoints(value: any) { this.set("placedPoints", value); }

    get newPointColor(): string { return this.get("newPointColor"); }
    set newPointColor(value: string) { this.set("newPointColor", value); }

    get validationData(): any { return this.get("validationData"); }
    set validationData(value: any) { this.set("validationData", value); }

    get pointPlotType(): any { return this.get("pointPlotType"); }
    set pointPlotType(value: any) { this.set("pointPlotType", value); }

    get label(): any { return this.get("label"); }
    set label(value: any) { this.set("label", value); }

    get ticks(): any { return this.get("ticks"); }
    set ticks(value: any) { this.set("ticks", value); }

    get propname(): any { return this.get("propname"); }
    set propname(value: any) { this.set("propname", value); }

    public defaults() {
        return {
            disabled: false,
            fetchDataType: SAVE_DATA_TYPES.BASIC,
            maxPoints: -1,
            saveDataType: SAVE_DATA_TYPES.BASIC,
            validationType: VALIDATION_TYPES.EQUAL,
            width: 700
        };
    }

}
