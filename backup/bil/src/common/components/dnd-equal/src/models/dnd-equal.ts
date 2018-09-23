import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";

export const VALIDATION_TYPES = {
    BASIC: "basic",
    ROW_COL: "row-col"
};

export const DROPSLOT_TYPES = {
    DYNAMIC: "dynamic",
    STATIC: "static"
};

export const TOOL_TYPE = {
    BASIC: "basic",
    DROP_ZONES: "drop-zones"
};

export declare class DropSlotAttributes {
    public min: number;
    public max: number;
    public default?: number;
    public type?: string;
}

export declare class DndEqualAttributes {
    public dropslots?: DropSlotAttributes;
    public validation?: any;
    public saveData?: boolean;
    public savedData?: any;
}

export class DndEqual extends Backbone.Model {
    constructor(attr: DndEqualAttributes) {
        super(attr);
        if (this.excludePrevious) {
            this.excludePreviousAnswer();
        }
    }

    get dropslots(): DropSlotAttributes { return this.get("dropslots"); }

    get excludePrevious(): boolean { return this.get("excludePrevious"); }
    set excludePrevious(value: boolean) { this.set("excludePrevious", value); }

    get validationData(): any { return this.get("validation"); }
    set validationData(value: any) { this.set("validation", value); }

    get columns(): number { return this.get("columns"); }

    get maxDrags(): number { return this.get("max"); }

    get toolType(): string { return this.get("type"); }

    get validationType(): string { return this.get("validationType"); }

    get saveData(): boolean { return this.get("saveData"); }
    set saveData(value: boolean) { this.set("saveData", value); }

    get savedData(): any { return this.get("savedData"); }
    set savedData(value: any) { this.set("savedData", value); }

    get prefilled(): any { return this.get("prefilled"); }
    set prefilled(value: any) { this.set("prefilled", value); }

    public defaults() {
        return {
            columns: 6,
            dropslots: {
                default: 0,
                type: "dynamic"
            },
            max: 24,
            type: TOOL_TYPE.BASIC,
            validation: {},
            validationType: VALIDATION_TYPES.BASIC
        };
    }

    public isStatic() {
        return this.dropslots.type === DROPSLOT_TYPES.STATIC;
    }

    private excludePreviousAnswer(): void {
        const prevAnswer = this.savedData.answer;
        const index = this.validationData.slots.indexOf(prevAnswer);
        if (index >= 0) {
            this.validationData.slots.splice(index, 1);
        }
        if (this.validationData.answer == prevAnswer) {
            this.validationData.answer = this.validationData.slots[0];
        }
    }

}
