import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";

export declare class CustomLearnosityAttributes {
    public question: string;
    public response: string;
    public responseTypes: Map<string, Response>;
}

export class DNDImageAttributes {
    public disabled?: boolean;
    public savedData?: any;
    public saveDataType?: string;
}

export const SAVE_DATA_TYPES = {
    CUSTOM: "custom",
    LRN_ANSWERS: "lrn-answers"
};

export const VALIDATION_TYPES = {
    BASIC: "basic",
    CUSTOM: "custom"
};

export const RESPONSE_TYPES = {
    INPUT: "input"
};

export declare class Validation {
    public type: string;
    public value: any;
}

export declare class Response {
    public respID: string;
    public idx: number;
    public type: string;
    public validation: Validation;
    public isTouchDevice: boolean;
}

export class CustomLearnosity extends Backbone.Model {
    constructor(attr: CustomLearnosityAttributes) {
        super(attr);
    }

    get question(): string { return this.get("question"); }
    set question(value: string) { this.set("question", value); }

    get response(): string { return this.get("response"); }
    set response(value: string) { this.set("response", value); }

    get correct(): boolean { return this.get("correct"); }
    set correct(value: boolean) { this.set("correct", value); }

    get responseTypes(): Map<string, Response> { return this.get("responseTypes"); }

    get validationType(): string { return this.get("validationType"); }

    get saveDataType(): string { return this.get("saveDataType"); }

    get fetchDataType(): string { return this.get("fetchDataType"); }

    get disabled(): boolean { return this.get("disabled"); }

    get savedData(): any { return this.get("savedData"); }

    get replaceAnswers(): boolean { return this.get("replaceAnswers"); }

    get validationFn(): string { return this.get("validationFn"); }

    get showAnswerFn(): string { return this.get("showAnswerFn"); }

    get saveDataFn(): string { return this.get("saveDataFn"); }

    get fetchDataFn(): string { return this.get("fetchDataFn"); }

    public defaults() {
        return {
            correct: false,
            disabled: false,
            fetchDataType: SAVE_DATA_TYPES.LRN_ANSWERS,
            question: "",
            replaceAnswers: false,
            response: "",
            responseTypes: null as Map<string, Response>,
            saveDataType: SAVE_DATA_TYPES.LRN_ANSWERS,
            validationType: VALIDATION_TYPES.BASIC
        };
    }

    public initialize(attributes: any, options: any) {
        super.initialize(attributes, options);
        this._updateAnswers();
    }

    private _updateAnswers() {
        const responses = this.responseTypes;
        if (this.fetchDataType === SAVE_DATA_TYPES.LRN_ANSWERS) {
            for (const responseID in responses) {
                if (responses[responseID]) {
                    if (responses[responseID].validation) {
                        if (responses[responseID].validation.value === "{{fetch}}") {
                            responses[responseID].validation.value = this.savedData.answers[responses[responseID].idx];
                        }
                    }
                }
            }
        }
    }

}
