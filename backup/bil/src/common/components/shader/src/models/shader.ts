import * as Backbone from "backbone";

export declare class ShaderAttributes {
    [x: string]: any;
}

export const COLORS = [
    "yellow",
    "blue",
    "orange",
    "red",
    "white"
];

export const SAVE_DATA_TYPES = {
    CUSTOM: "custom",
    SHADED_ANY: "shaded-any",
    SHADED_COL: "shaded-col",
    SHADED_ROW_COL: "shaded-row-col"
};

export const GAME_TYPE = {
    ADDITION: "addition",
    ARROWS: "arrows",
    CELL_SELECT: "cell-select",
    COL_SELECTION: "col-selection",
    CREATION: "creation",
    DISABLED: "disabled",
    MULTIPLE: "multiple",
    MULTIPLICATION: "multiplication",
    SELECTION: "selection"
};

export const VALIDATION_TYPES = {
    CELL_SELECT: "cell-select",
    COLUMN: "column-select",
    COLUMN_ANY: "column-any",
    COUNT: "count",
    COUNT_ANY: "count-any",
    COUNT_COLOR: "count-color",
    COUNT_COLOR_IN_COL: "count-color-in-col",
    CUSTOM: "custom",
    DIVIDE: "divide",
    DIVIDE_COLOR: "divide-color",
    FRACTION: "fraction",
    MULTIPLES: "multiples",
    MULTI_SELECT: "multi-select",
    NUMBERED: "numbered",
    PRODUCT: "product",
    ROW_SELECT: "row-select"
};

export class Shader extends Backbone.Model {
    constructor(attr: ShaderAttributes) {
        super(attr);
        if (typeof attr.colors == "number") {
            this.colors = [];
            for (let i = 0; i < attr.colors; i++) {
                this.colors.push(COLORS[i]);
            }
        }
        if (attr.filled !== void 0 && typeof attr.filled.color == "number") {
            this.filled.color = this.colors[attr.filled.color];
        }
    }

    get rows(): number { return this.get("rows"); }
    set rows(value: number) { this.set("rows", value); }

    get cols(): number { return this.get("cols"); }
    set cols(value: number) { this.set("cols", value); }

    get type(): string { return this.get("type"); }
    set type(value: string) { this.set("type", value); }

    get selection(): number { return this.get("selection"); }
    set selection(value: number) { this.set("selection", value); }

    get validation(): boolean { return this.get("validation"); }
    set validation(value: boolean) { this.set("validation", value); }

    get disabled(): boolean { return this.get("disabled"); }
    set disabled(value: boolean) { this.set("disabled", value); }

    get colors(): string[] { return this.get("colors"); }
    set colors(value: string[]) { this.set("colors", value); }

    get gridCount(): number { return this.get("gridCount"); }
    set gridCount(value: number) { this.set("gridCount", value); }

    get numbered(): boolean { return this.get("numbered"); }
    set numbered(value: boolean) { this.set("numbered", value); }

    get showNumbers(): boolean { return this.get("showNumbers"); }
    set showNumbers(value: boolean) { this.set("showNumbers", value); }

    get filled(): any { return this.get("filled"); }
    set filled(value: any) { this.set("filled", value); }

    get filledData(): any { return this.get("filledData"); }
    set filledData(value: any) { this.set("filledData", value); }

    get validationType(): string { return this.get("validationData").type; }

    get fetchDataType(): string { return this.get("fetchDataType"); }

    get saveDataType(): string { return this.get("saveDataType"); }

    get saveDataFn(): string { return this.get("saveDataFn"); }

    get fetchDataFn(): string { return this.get("fetchDataFn"); }

    get viewUpdateFn(): string { return this.get("viewUpdateFn"); }

    get validationFn(): string { return this.get("validationFn"); }

    get showAnswerFn(): string { return this.get("showAnswerFn"); }

    get savedData(): any { return this.get("savedData"); }

    get showMeAns(): any { return this.get("showMeAns"); }

    get validationData(): any { return this.get("validationData"); }

    get sliderValues(): any { return this.get("sliderValues"); }

    get selectionString(): string { return this.selection.toString(2); }

    get labelPrecision(): number { return this.get("labelPrecision"); }

    get selectedColorIdx(): number { return this.get("selectedColorIdx"); }

    public defaults() {
        return {
            colors: [] as string[],
            cols: 5,
            fetchDataType: null as string,
            gridCount: 1,
            labelPrecision: 1,
            numbered: false,
            rows: 5,
            saveDataType: null as string,
            savedData: null as any,
            selectedColorIdx: 0,
            showNumbers: true,
            type: GAME_TYPE.MULTIPLICATION
        };
    }

    private _break(arr: any[], size: number) {
        const chunks = [];
        const _items = arr.length;
        for (let i = 0; i < _items; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }

    private _selectionArray() {
        return this._break(this.selectionString.split("").reverse(), this.cols);
    }

}
