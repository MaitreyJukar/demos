import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";

export declare class ClickNClickAttributes {
    public disabled?: boolean;
    public savedData?: any;
    public saveDataType?: string;
    public validationType?: string;
}

export const TOOL_TYPE = {
    BASIC: "basic",
    RADIO: "radio"
};

export const SAVE_DATA_TYPES = {
    BASIC: "basic",
    CUSTOM: "custom"
};

export const VALIDATION_TYPES = {
    BASIC: "basic",
    COUNTERTYPE: "counterType",
    CUSTOM: "custom"
};

export class ClickNClick extends Backbone.Model {
    constructor(attr: ClickNClickAttributes) {
        super(attr);
    }

    get type(): string { return this.get("type"); }
    set type(value: string) { this.set("type", value); }

    get validationType(): string { return this.get("validationType"); }

    get saveDataType(): string { return this.get("saveDataType"); }

    get fetchDataType(): string { return this.get("fetchDataType"); }

    get disabled(): boolean { return this.get("disabled"); }

    get savedData(): any { return this.get("savedData"); }

    get saveDataFn(): string { return this.get("saveDataFn"); }

    get fetchDataFn(): string { return this.get("fetchDataFn"); }

    get validationFn(): string { return this.get("validationFn"); }

    get showAnswerFn(): string { return this.get("showAnswerFn"); }

    get counterArea(): any { return this.get("counterArea"); }
    set counterArea(value: any) { this.set("counterArea", value); }

    get validationData(): any { return this.get("validationData"); }
    set validationData(value: any) { this.set("validationData", value); }

    public defaults() {
        return {
            disabled: false,
            fetchDataType: SAVE_DATA_TYPES.BASIC,
            saveDataType: SAVE_DATA_TYPES.BASIC,
            type: TOOL_TYPE.BASIC,
            validationType: VALIDATION_TYPES.BASIC
        };
    }

}
