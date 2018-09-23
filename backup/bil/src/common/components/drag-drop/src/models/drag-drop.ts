import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";

export declare class DragDropAttributes {
}

export const VALIDATION_TYPES = {
    COMPARE: "compare",
    SUBTRACT: "subtract"
};

export const ACTIVITY_TYPE = {
    DRAG_DROP: "drag-drop",
    GROUP: "group",
    MODEL: "model",
    SUBTRACT: "subtract",
    SUBTRACT_MODEL: "subtract-model"
};

export const BUTTON_POS = {
    BOTTOM: "bottom",
    RIGHT: "right"
};

export const THEMES = {
    BASIC: "basic",
    BLUE: "blue"
};

export class DragDrop extends Backbone.Model {
    constructor(attr: DragDropAttributes) {
        super(attr);
    }

    get maxBlocks(): number { return this.get("maxBlocks"); }
    set maxBlocks(value: number) { this.set("maxBlocks", value); }

    get max(): any { return this.get("max"); }
    set max(value: any) { this.set("max", value); }

    get unitNames(): string[] { return this.get("unitNames"); }
    set unitNames(value: string[]) { this.set("unitNames", value); }

    get headers(): string[] { return this.get("headers"); }
    set headers(value: string[]) { this.set("headers", value); }

    get draggableUnitNames(): string[] { return this.get("draggableUnitNames"); }
    set draggableUnitNames(value: string[]) { this.set("draggableUnitNames", value); }

    get ones(): number { return this.get("ones"); }
    set ones(value: number) { this.set("ones", value); }

    get tens(): number { return this.get("tens"); }
    set tens(value: number) { this.set("tens", value); }

    get hundreds(): number { return this.get("hundreds"); }
    set hundreds(value: number) { this.set("hundreds", value); }

    get thousands(): number { return this.get("thousands"); }
    set thousands(value: number) { this.set("thousands", value); }

    get validation(): boolean { return this.get("validation"); }
    set validation(value: boolean) { this.set("validation", value); }

    get validationType(): string { return this.get("validationType"); }
    set validationType(value: string) { this.set("validationType", value); }

    get activityType(): string { return this.get("activityType"); }
    set activityType(value: string) { this.set("activityType", value); }

    get disableInitial(): boolean { return this.get("disableInitial"); }
    set disableInitial(value: boolean) { this.set("disableInitial", value); }

    get comparisonValue(): number { return this.get("comparisonValue"); }
    set comparisonValue(value: number) { this.set("comparisonValue", value); }

    get numbers(): number[] { return this.get("numbers"); }
    set numbers(value: number[]) { this.set("numbers", value); }

    get divideFactor(): number { return this.get("divideFactor"); }
    set divideFactor(value: number) { this.set("divideFactor", value); }

    get prefilled(): any[] { return this.get("prefilled"); }
    set prefilled(value: any[]) { this.set("prefilled", value); }

    get specificAnswer(): any { return this.get("specificAnswer"); }
    set specificAnswer(value: any) { this.set("specificAnswer", value); }

    get buttonPos(): string { return this.get("buttonPos"); }
    set buttonPos(value: string) { this.set("buttonPos", value); }

    get theme(): string { return this.get("theme"); }

    public defaults() {
        return {
            activityType: ACTIVITY_TYPE.DRAG_DROP,
            buttonPos: BUTTON_POS.RIGHT,
            disableInitial: false,
            divideFactor: 1,
            hundreds: 0,
            maxBlocks: 18,
            ones: 0,
            prefilled: [] as number[],
            specificAnswer: null as any,
            tens: 0,
            theme: THEMES.BASIC,
            thousands: 0,
            unitNames: ["ones", "tens", "hundreds", "thousands"]
        };
    }

    public incrementOnes() {
        let prevOnes = this.ones;
        this.set("ones", ++prevOnes);
    }

    public decrementOnes() {
        let prevOnes = this.ones;
        this.set("ones", --prevOnes);
    }

    public incrementTens() {
        let prevTens = this.tens;
        this.set("tens", ++prevTens);
    }

    public decrementTens() {
        let prevTens = this.tens;
        this.set("tens", --prevTens);
    }
    public incrementHundreds() {
        let prevHundreds = this.hundreds;
        this.set("hundreds", ++prevHundreds);
    }

    public decrementHundreds() {
        let prevHundreds = this.hundreds;
        this.set("hundreds", --prevHundreds);
    }
    public incrementThousands() {
        let prevThousands = this.thousands;
        this.set("thousands", ++prevThousands);
    }

    public decrementThousands() {
        let prevThousands = this.thousands;
        this.set("thousands", --prevThousands);
    }

    public getCurrentValue() {
        const value = this.ones + this.tens * 10 + this.hundreds * 100 + this.thousands * 1000;
        return value / this.divideFactor;
    }

}
