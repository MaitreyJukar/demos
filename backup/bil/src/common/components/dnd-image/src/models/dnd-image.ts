import * as Backbone from "backbone";
import * as _ from "underscore";

export class DNDImageAttributes {
    public checkEnabled?: boolean;
    public dropZones?: DropZone[];
    public draggables?: DraggableImage[];
    public disabled?: boolean;
    public dispenser?: boolean;
    public savedData?: any;
    public alttext?: string;
    public keepShowAnswer?: boolean;
    public max?: number;
    public saveDataType?: string;
    public type?: string;
    public validationType?: string;
    public validationData?: any;
    public replayOnTryAgain = true;
    public showMe = false;
    public dispenserPos = "right";
}

export class RandomCounterData {
    public isCircular: any;
    public max: number;
    public type: number;
}

export const SAVE_DATA_TYPES = {
    CUSTOM: "custom",
    DYNAMIC_POS: "dynamic",
    FIXED_POS: "fixed",
    LRN_ANSWERS: "lrn-answers",
    NUMBER_ADDITION: "number-addition"
};

export const VALIDATION_TYPES = {
    ALT_ANS: "alternate-answers",
    ALT_ANS_COUNT: "alternate-answers-count",
    BASE_TEN_COUNT: "base-ten-count",
    BASIC: "basic",
    COUNT: "count",
    CUSTOM: "custom",
    DYNAMIC_COUNT: "dynamic-count"
};

export const TOOL_TYPE = {
    BASIC: "basic",
    NEW_COUNTERS: "new-counters",
    RANDOM_COUNTERS: "random-counters",
    RANDOM_LINKED_COUNTERS: "random-linked-counters"
};

export class DropZone {
    public top: number;
    public left: number;
    public height: number;
    public width: number;
    public allow: number[];
    public max = -1;
    public type: number;
    public answer: Answer[] = [];
    public snap = false;
    public dropped?: DragCounter[] = [];
    public alttext = "";
    public path?: string;
    public tolerance?: string;
    public maxTypes?: any;
    public isRandomCounter = false;
    public isCircular = false;
    public randomGenerationData?: RandomGenerationData;
}

export class RandomGenerationData {
    public count: number;
    public types: any[];
    public zones: any[];
    public min: any;
}

export class DraggableImage {
    public type: number;
    public alttext: string;
    public na: boolean;
    public controlPoints?: number[][];
}

export class Answer {
    public type: number;
    public count: number;
}

export class DragCounter {
    public type: number;
    public count: number;
    public keep = false;
    public top?: number;
    public left?: number;
    public drag = true;
    public tolerance?: string;
}

export class DNDImage extends Backbone.Model {
    constructor(attr: DNDImageAttributes) {
        super(attr);
    }

    get currentLanguage(): string { return this.get("currentLanguage"); }
    set currentLanguage(value: string) { this.set("currentLanguage", value); }

    get dropZones(): DropZone[] { return this.get("dropZones"); }
    set dropZones(value: DropZone[]) { this.set("dropZones", value); }

    get draggables(): DraggableImage[] { return this.get("draggables"); }
    set draggables(value: DraggableImage[]) { this.set("draggables", value); }

    get toolType(): string { return this.get("type"); }

    get validationType(): string { return this.get("validationType"); }

    get saveDataType(): string { return this.get("saveDataType"); }

    get fetchDataType(): string { return this.get("fetchDataType"); }
    set fetchDataType(value: string) { this.set("fetchDataType", value); }

    get disabled(): boolean { return this.get("disabled"); }

    get savedData(): any { return this.get("savedData"); }

    get enableSavedDragging(): any { return this.get("enableSavedDragging"); }

    get dispenser(): boolean { return this.get("dispenser"); }

    get keepShowAnswer(): boolean { return this.get("keepShowAnswer"); }

    get alttext(): string { return this.get("alttext"); }

    get checkEnabled(): boolean { return this.get("checkEnabled"); }

    get max(): number { return this.get("max"); }

    get validationData(): any { return this.get("validationData"); }

    get replayOnTryAgain(): boolean { return this.get("replayOnTryAgain"); }

    get saveDataFn(): string { return this.get("saveDataFn"); }

    get fetchDataFn(): string { return this.get("fetchDataFn"); }

    get validationFn(): string { return this.get("validationFn"); }

    get showAnswerFn(): string { return this.get("showAnswerFn"); }

    get showMe(): boolean { return this.get("showMe"); }

    get randomGenerationData(): RandomGenerationData { return this.get("randomGenerationData"); }

    get randomCounterData(): RandomCounterData { return this.get("randomCounterData"); }
    set randomCounterData(value: RandomCounterData) { this.set("randomCounterData", value); }

    get dispenserPos(): string { return this.get("dispenserPos"); }

    public defaults() {
        return {
            checkEnabled: false,
            disabled: false,
            dispenser: true,
            dispenserPos: "right",
            draggables: [] as DraggableImage[],
            dropZones: [] as DropZone[],
            fetchDataType: SAVE_DATA_TYPES.FIXED_POS,
            max: -1,
            replayOnTryAgain: true,
            saveDataType: SAVE_DATA_TYPES.FIXED_POS,
            showMe: false,
            type: TOOL_TYPE.BASIC,
            validationData: null as any,
            validationType: VALIDATION_TYPES.BASIC
        };
    }

    public getTotalValidCounters() {
        let count = 0;
        for (const dropZone of this.dropZones) {
            for (const answer of dropZone.answer) {
                count += answer.count;
            }
        }
        return count;
    }

    public getDropZoneValidationData(type: any) {
        const validationData = this.validationData.dropZoneData;
        for (const currValidationData of validationData) {
            if (type === currValidationData.dropZonetype) {
                return currValidationData;
            }
        }
    }

    public getDraggableDataByType(type: any) {
        for (const draggable of this.draggables) {
            if (draggable.type === Number(type)) {
                return draggable;
            }
        }
        return null;
    }

}
