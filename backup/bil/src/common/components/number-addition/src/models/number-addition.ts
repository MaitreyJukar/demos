import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";

export declare class NumberAdditionAttributes {
    public disabled?: boolean;
    public savedData?: any;
    public saveDataType?: string;
    public validationType?: string;
}

export const SAVE_DATA_TYPES = {
    BASIC: "basic",
    CUSTOM: "custom"
};

export const VALIDATION_TYPES = {
    BASIC: "basic",
    CUSTOM: "custom"
};

export class NumberAddition extends Backbone.Model {
    constructor(attr: NumberAdditionAttributes) {
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

    get propname(): any { return this.get("propname"); }
    set propname(value: any) { this.set("propname", value); }

    public defaults() {
        return {
            disabled: false,
            fetchDataType: SAVE_DATA_TYPES.BASIC,
            saveDataType: SAVE_DATA_TYPES.BASIC,
            validationType: VALIDATION_TYPES.BASIC
        };
    }

}
