import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";
import * as Utilities from "./../../../../helper/utilities";
import CommonUtilities = Utilities;
import * as GridModelPkg from "./grid-model";

export enum Behaviour {
    Static,
    Dynamic
}

export interface Prefilled {
    main?: GridModelPkg.TileFormat[];
    vertical?: GridModelPkg.TileFormat[];
    horizontal?: GridModelPkg.TileFormat[];
}

export enum Types {
    Inner,
    Outer,
    Scratchpad
}

export enum Operation {
    Multiplication
}

export interface Equation {
    x: number; // Coeff of x.
    c: number; // Constant.
}

export interface RHS {
    equations?: Equation[];
    rows?: number;
    cols?: number;
    prefilled?: any;
    state?: string;
}

export interface Question {
    operation: string;
    type: string;
    equations?: Equation[];
    rows?: number;
    cols?: number;
    prefilled?: any;
    showSolution?: boolean;
    fillEquation1?: boolean;
    fillEquation2?: boolean;
    rhs?: RHS;
}

export interface JsonStruct {
    questions: Question[];
    question: Question;
}

export interface TableStruct {
    cols: number;
    rows: number;
}

export interface ParsedData {
    row?: TableStruct;
    col?: TableStruct;
    canvas?: TableStruct;
    state?: string;
    rhs?: ParsedData;
}

export class GridView {
    public rowData?: GridModelPkg.TileFormat[] = [];
    public colData?: GridModelPkg.TileFormat[] = [];
    public canvasData?: GridModelPkg.TileFormat[] = [];
    // public canvasXPosition?: number[] = [];
    // public canvasYPosition?: number[] = [];
    // public verticalXPosition?: number[] = [];
    // public verticalYPosition?: number[] = [];
    // public horizontalXPosition?: number[] = [];
    // public horizontalYPosition?: number[] = [];
    public rhs?: GridView;
}

export interface Attributes {
    algeData?: JsonStruct;
    behaviour?: Behaviour;
    gridViewData?: GridView[];
    currentLanguage?: Utilities.Language;
    locTextData?: any;
}

export const VALIDATION_TYPES = {
    BASIC: "basic",
    CUSTOM: "custom"
};

export class AlgebraTiles extends Backbone.Model {
    get type(): string[] { return this.get("type"); }
    set type(value: string[]) { this.set("type", value); }

    get operation(): Operation { return this.get("operation"); }
    set operation(value: Operation) { this.set("operation", value); }

    get algeData(): JsonStruct { return this.get("algeData"); }
    set algeData(value: JsonStruct) { this.set("algeData", value); }

    get gridViewData(): GridView[] { return this.get("gridViewData"); }
    set gridViewData(value: GridView[]) { this.set("gridViewData", value); }

    get gridAnswerData(): GridView[] { return this.get("gridAnswerData"); }
    set gridAnswerData(value: GridView[]) { this.set("gridAnswerData", value); }

    get noOfGrids(): number { return this.get("noOfGrids"); }
    set noOfGrids(value: number) { this.set("noOfGrids", value); }

    get showSolution(): boolean[] { return this.get("showSolution"); }
    set showSolution(value: boolean[]) { this.set("showSolution", value); }

    get fillEquation1(): boolean[] { return this.get("fillEquation1"); }
    set fillEquation1(value: boolean[]) { this.set("fillEquation1", value); }

    get fillEquation2(): boolean[] { return this.get("fillEquation2"); }
    set fillEquation2(value: boolean[]) { this.set("fillEquation2", value); }

    get isScratchpad(): boolean[] { return this.get("isScratchpad"); }
    set isScratchpad(value: boolean[]) { this.set("isScratchpad", value); }

    get isInner(): boolean[] { return this.get("isInner"); }
    set isInner(value: boolean[]) { this.set("isInner", value); }

    get behaviour(): Behaviour { return this.get("behaviour"); }
    set behaviour(value: Behaviour) { this.set("behaviour", value); }

    get locTextData(): { [id: string]: string } { return this.get("locTextData"); }
    set locTextData(value: { [id: string]: string }) { this.set("locTextData", value); }

    get currentLanguage(): Utilities.Language { return this.get("currentLanguage"); }
    set currentLanguage(value: Utilities.Language) { this.set("currentLanguage", value); }

    get validationType(): string { return this.get("validationType"); }

    get validationFn(): string { return this.get("validationFn"); }

    get showAnswerFn(): string { return this.get("showAnswerFn"); }

    get validationData(): any { return this.get("validationData"); }

    constructor(attr?: Attributes) {
        super(attr);
    }

    public defaults() {
        return {
            algeData: {},
            behaviour: Behaviour.Dynamic,
            currentLanguage: Utilities.Language.ENGLISH,
            fillEquation1: [] as boolean[],
            fillEquation2: [] as boolean[],
            isInner: [] as boolean[],
            isScratchpad: [] as boolean[],
            locTextData: {},
            noOfGrids: 1,
            operation: Operation.Multiplication,
            prefilled: {},
            showSolution: [] as boolean[],
            type: [Types.Inner],
            validationType: VALIDATION_TYPES.BASIC
        };
    }

    /**
     * Returns Promise for parsed data.
     * @param url Valid json url, if not passed then model's current `algeData` will be parsed.
     */
    public getJSON(url?: string) {
        return new Promise<ParsedData[]>((res, rej) => {
            if (url !== void 0) {
                $.ajax({
                    error: rej,
                    success: this.parseData.bind(this, res),
                    url
                });
            } else {
                this.parseData(res, this.algeData);
            }
        });
    }

    public deepCopy(obj: any) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Parses Json data and executes given callback.
     * @param res Callback function.
     * @param data Json data.
     */
    public parseData(res: (value: ParsedData[]) => void, data: JsonStruct) {
        if (data.questions == void 0 && data.question !== void 0) {
            data.questions = [data.question];
        }
        this.algeData = JSON.parse(JSON.stringify(data));
        this.gridViewData = [];
        this.gridAnswerData = [];
        let data2: ParsedData[] = [];
        this.noOfGrids = data.questions.length;
        const questions: Question[] = [];
        this.showSolution = [];
        this.fillEquation1 = [];
        this.fillEquation2 = [];
        this.type = [];
        for (const [index, que] of data.questions.entries()) {
            this.type.push(que.type);
            this.showSolution[index] = (que.showSolution) ? true : false;
            this.fillEquation1[index] = (que.fillEquation1) ? true : false;
            this.fillEquation2[index] = (que.fillEquation2) ? true : false;
            this.isScratchpad[index] = (que.type === Types[Types.Scratchpad]) ? true : false;
            this.isInner[index] = (que.type === Types[Types.Inner]) ? true : false;
            const equations = que.equations;
            const rhs = que.rhs;
            const prefilledData = (que.prefilled === void 0) ? null : que.prefilled;
            data2 = this.setQuestionParsedData(data2, que, index);
            let gridViewData: GridView = new GridView();
            if (!this.isScratchpad[index]) {
                gridViewData = this.setQuestionEquationsData(gridViewData, que);
            }
            this.gridViewData[index] = gridViewData;
            this.gridAnswerData[index] = this.deepCopy(gridViewData);
            if (prefilledData) {
                gridViewData = this.setPrefilledData(gridViewData, prefilledData, index);
            }
            const rhsPrefilledData = (que.rhs !== void 0 && que.rhs.prefilled !== void 0) ? que.rhs.prefilled : null;
            if (rhsPrefilledData) {
                gridViewData.rhs = new GridView();
                gridViewData.rhs = this.setPrefilledData(gridViewData.rhs, rhsPrefilledData, index);
            }

            res(data2);
        }
    }

    public setQuestionParsedData(data2: ParsedData[], que: Question, index: number): ParsedData[] {
        const equations = que.equations;
        const rhs = que.rhs;
        data2[index] = {};
        data2[index].row = {
            cols: 1,
            rows: this.isScratchpad[index] ? que.cols : (Math.abs(equations[1].x) * 2) + Math.abs(equations[1].c)
        };
        data2[index].col = {
            cols: this.isScratchpad[index] ? que.rows : (Math.abs(equations[0].x) * 2) + Math.abs(equations[0].c),
            rows: 1
        };
        data2[index].canvas = {
            cols: this.isScratchpad[index] ? que.rows : (Math.abs(equations[0].x) * 2) + Math.abs(equations[0].c),
            rows: this.isScratchpad[index] ? que.cols : (Math.abs(equations[1].x) * 2) + Math.abs(equations[1].c)
        };
        if (rhs !== void 0) {
            const rhsEquations = que.rhs.equations;
            data2[index].rhs = {};
            data2[index].rhs.state = (que.rhs.state) ? que.rhs.state : void 0;
            data2[index].rhs.row = {
                cols: 1,
                rows: this.isScratchpad[index] ? que.rhs.cols : (Math.abs(rhsEquations[1].x) * 2) + Math.abs(rhsEquations[1].c)
            };
            data2[index].rhs.col = {
                cols: this.isScratchpad[index] ? que.rhs.rows : (Math.abs(rhsEquations[0].x) * 2) + Math.abs(rhsEquations[0].c),
                rows: 1
            };
            data2[index].rhs.canvas = {
                cols: this.isScratchpad[index] ? que.rhs.rows : (Math.abs(rhsEquations[0].x) * 2) + Math.abs(rhsEquations[0].c),
                rows: this.isScratchpad[index] ? que.rhs.cols : (Math.abs(rhsEquations[1].x) * 2) + Math.abs(rhsEquations[1].c)
            };
        }
        return data2;
    }

    public setQuestionEquationsData(gridViewData: GridView, que: Question): GridView {
        const equations = que.equations;
        const rhs = que.rhs;
        const isXColPlus = !(equations[0].x < 0);
        const isCoffColPlus = !(equations[0].c < 0);
        for (let i = 0; i < Math.abs(equations[0].x); i++) {
            const type = (isXColPlus) ?
                GridModelPkg.Tiles.PLUS_X_VERTICAL : GridModelPkg.Tiles.MINUS_X_VERTICAL;
            gridViewData.colData.push({
                type
            });
            // gridViewData.colData.push((isXColPlus) ?
            //     GridModelPkg.Tiles.PLUS_X_VERTICAL : GridModelPkg.Tiles.MINUS_X_VERTICAL);
        }
        for (let i = 0; i < Math.abs(equations[0].c); i++) {
            const type = (isCoffColPlus) ? GridModelPkg.Tiles.PLUS : GridModelPkg.Tiles.MINUS;
            gridViewData.colData.push({
                type
            });
        }

        const isXRowPlus = !(equations[1].x < 0);
        const isCoffRowPlus = !(equations[1].c < 0);
        for (let i = 0; i < Math.abs(equations[1].x); i++) {
            const type = (isXRowPlus) ? GridModelPkg.Tiles.PLUS_X_HORIZONTAL : GridModelPkg.Tiles.MINUS_X_HORIZONTAL;
            gridViewData.rowData.push({
                type
            });
        }
        for (let i = 0; i < Math.abs(equations[1].c); i++) {
            const type = (isCoffRowPlus) ? GridModelPkg.Tiles.PLUS : GridModelPkg.Tiles.MINUS;
            gridViewData.rowData.push({
                type
            });
        }

        let canvasColPos = 0;
        for (const [i, colHeaderTile] of gridViewData.colData.entries()) {
            let canvasRowPos = 0;
            for (const [j, rowHeaderTile] of gridViewData.rowData.entries()) {
                const canvasTile = (colHeaderTile.type + rowHeaderTile.type) % 8;
                // gridViewData.canvasData.push(canvasTile);
                // gridViewData.canvasXPosition.push(canvasRowPos);
                // gridViewData.canvasYPosition.push(canvasColPos);
                gridViewData.canvasData.push({
                    type: canvasTile,
                    xPos: canvasRowPos,
                    yPos: canvasColPos
                });
                canvasRowPos = canvasRowPos + GridModelPkg.Grid.getTileSize(rowHeaderTile.type);
            }
            const colHeaderTileHeight = GridModelPkg.Grid.getTileSize(colHeaderTile.type);
            canvasColPos = canvasColPos + colHeaderTileHeight;
        }
        if (rhs !== void 0) {
            const rhsEquations = que.rhs.equations;
            gridViewData.rhs = {};
            const rhsIsXColPlus = !(rhsEquations[0].x < 0);
            const rhsIsCoffColPlus = !(rhsEquations[0].c < 0);
            for (let i = 0; i < Math.abs(rhsEquations[0].x); i++) {
                const type = (rhsIsXColPlus) ?
                    GridModelPkg.Tiles.PLUS_X_VERTICAL : GridModelPkg.Tiles.MINUS_X_VERTICAL;
                gridViewData.rhs.colData.push({
                    type
                });
            }
            for (let i = 0; i < Math.abs(rhsEquations[0].c); i++) {
                const type = (rhsIsCoffColPlus) ? GridModelPkg.Tiles.PLUS : GridModelPkg.Tiles.MINUS;
                gridViewData.rhs.colData.push({
                    type
                });
            }

            const rhsIsXRowPlus = !(rhsEquations[1].x < 0);
            const rhsIsCoffRowPlus = !(rhsEquations[1].c < 0);
            for (let i = 0; i < Math.abs(rhsEquations[1].x); i++) {
                const type = (rhsIsXRowPlus) ?
                    GridModelPkg.Tiles.PLUS_X_HORIZONTAL : GridModelPkg.Tiles.MINUS_X_HORIZONTAL;
                gridViewData.rhs.rowData.push({
                    type
                });
            }
            for (let i = 0; i < Math.abs(rhsEquations[1].c); i++) {
                const type = (rhsIsCoffRowPlus) ? GridModelPkg.Tiles.PLUS : GridModelPkg.Tiles.MINUS;
                gridViewData.rhs.rowData.push({
                    type
                });
            }

            let rhsCanvasColPos = 0;
            for (const [i, colHeaderTile] of gridViewData.rhs.colData.entries()) {
                let rhsCanvasRowPos = 0;
                for (const [j, rowHeaderTile] of gridViewData.rhs.rowData.entries()) {
                    const canvasTile = (colHeaderTile.type + rowHeaderTile.type) % 8;
                    gridViewData.rhs.canvasData.push({
                        type: canvasTile,
                        xPos: rhsCanvasRowPos,
                        yPos: rhsCanvasColPos
                    });
                    // gridViewData.rhs.canvasData.push(canvasTile);
                    // gridViewData.rhs.canvasXPosition.push(rhsCanvasRowPos);
                    // gridViewData.rhs.canvasYPosition.push(rhsCanvasColPos);
                    rhsCanvasRowPos = rhsCanvasRowPos + GridModelPkg.Grid.getTileSize(rowHeaderTile.type);
                }
                const colHeaderTileHeight = GridModelPkg.Grid.getTileSize(colHeaderTile.type);
                rhsCanvasColPos = rhsCanvasColPos + colHeaderTileHeight;
            }
        }
        return gridViewData;
    }

    /**
     * Sets prefilled data for given index if any.
     * @param data to set.
     * @param index on an index to set.
     */
    public setPrefilledData(gridViewData: GridView, data: Prefilled, index: number, isRHS?: boolean): GridView {
        gridViewData.canvasData = data.main ? data.main : [];
        if (data.vertical) {
            gridViewData.rowData = data.vertical;
        } else if (this.isScratchpad[index]) {
            gridViewData.rowData = [];
        }
        if (data.horizontal) {
            gridViewData.colData = data.horizontal;
        } else if (this.isScratchpad[index]) {
            gridViewData.colData = [];
        }
        return gridViewData;
    }

    /**
     * Returns if type if inner, false otherwise.
     */
    public isInnerType(index: number) {
        return this.type[index] === Types[Types.Inner];
    }

    public setAlgeTilesLocText(): any {
        const selectedLanguage = this.currentLanguage;
        const getLocText = CommonUtilities.Utilities.getLocText;
        const componentId = "algebra-tiles";

        this.locTextData = {
            algeTilesContainer: getLocText(selectedLanguage, componentId, "algebra-tiles-container"),
            draggableTile: getLocText(selectedLanguage, componentId, "draggable-tile"),
            gridCanvasArea: getLocText(selectedLanguage, componentId, "canvas-area"),
            gridColHeader: getLocText(selectedLanguage, componentId, "col-header"),
            gridContainer: getLocText(selectedLanguage, componentId, "grid-container"),
            gridRowHeader: getLocText(selectedLanguage, componentId, "row-header"),
            tile0: getLocText(selectedLanguage, componentId, "plus"),
            tile1: getLocText(selectedLanguage, componentId, "plus-x-vertical"),
            tile2: getLocText(selectedLanguage, componentId, "plus-x-horizontal"),
            tile3: getLocText(selectedLanguage, componentId, "plus-x-square"),
            tile4: getLocText(selectedLanguage, componentId, "minus"),
            tile5: getLocText(selectedLanguage, componentId, "minus-x-vertical"),
            tile6: getLocText(selectedLanguage, componentId, "minus-x-horizontal"),
            tile7: getLocText(selectedLanguage, componentId, "minus-x-square")
        };
    }
}
