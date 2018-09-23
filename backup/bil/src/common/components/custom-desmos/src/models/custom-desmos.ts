import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";

export declare class CustomDesmosAttributes {
    public desmosType: "calculator" | "geometry";
    public desmosURL: string;
    public savedData?: any;
    public saveDataType?: string;
    public settings: DesmosSettings;
}

export declare class DesmosSettings {

}

export const SAVE_DATA_TYPES = {
    BASIC: "basic",
    CUSTOM: "custom"
};

export const VALIDATION_TYPES = {
    CUSTOM: "custom"
};

export class CustomDesmos extends Backbone.Model {
    constructor(attr: CustomDesmosAttributes) {
        super(attr);
    }

    get desmosURL(): string { return this.get("desmosURL"); }
    set desmosURL(value: string) { this.set("desmosURL", value); }

    get desmosType(): string { return this.get("desmosType"); }
    set desmosType(value: string) { this.set("desmosType", value); }

    get settings(): DesmosSettings { return this.get("settings"); }

    get validationType(): string { return this.get("validationType"); }

    get validationFn(): string { return this.get("validationFn"); }

    get showAnswerFn(): string { return this.get("showAnswerFn"); }

    get savedData(): any { return this.get("savedData"); }

    get saveDataType(): string { return this.get("saveDataType"); }

    get fetchDataType(): string { return this.get("fetchDataType"); }

    get saveDataFn(): string { return this.get("saveDataFn"); }

    get fetchDataFn(): string { return this.get("fetchDataFn"); }

    public defaults() {
        return {
            desmosType: "calculator",
            desmosURL: "",
            settings: null as DesmosSettings
        };
    }

}
