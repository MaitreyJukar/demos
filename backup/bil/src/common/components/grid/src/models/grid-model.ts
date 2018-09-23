import * as Backbone from "backbone";
import * as $ from "jquery";
import * as _ from "underscore";
import * as Utilities from "./../../../../helper/utilities";
import CommonUtilities = Utilities;

export enum State {
    Disabled,
    Enabled
}

export enum Tiles {
    PLUS,
    PLUS_X_VERTICAL,
    PLUS_X_HORIZONTAL,
    PLUS_X_SQUARE,
    MINUS,
    MINUS_X_VERTICAL,
    MINUS_X_HORIZONTAL,
    MINUS_X_SQUARE
}

export interface TileFormat {
    type: Tiles;
    xPos?: number;
    yPos?: number;
    disabled?: boolean;
}

export interface SavedState {
    droppedTiles?: TileFormat[];
}

export interface DroppedTileFormat {
    tiles: Tiles[];
    xPos?: number[];
    yPos?: number[];
}

export interface Attributes {
    cols?: number;
    currentLanguage?: Utilities.Language;
    gridIndex?: number;
    isRHS?: boolean;
    hasRHS?: boolean;
    noOfGrids?: number;
    locTextData?: any;
    rows?: number;
    savedState?: SavedState;
    state?: State;
    type?: string;
}

export class Grid extends Backbone.Model {
    constructor(attr?: Attributes) {
        super(attr);
    }

    public static isPlusTile = (tile: Tiles) => (tile >= 0 && tile < 4);

    public static getTileSize(tile: Tiles): number {
        let size: number;
        switch (tile) {
            case 0:
            case 4:
                size = 1;
                break;
            case 2:
            case 6:
            case 1:
            case 5:
                size = 2;
                break;
            case 3:
            case 7:
                size = 4;
        }
        return size;
    }

    public static getDataTileSize = (tile: Tiles) => {
        switch (tile) {
            case 0:
            case 4:
                return 1;
            case 2:
            case 6:
                return 2;
            case 1:
            case 5:
                return 3;
            case 3:
            case 7:
                return 4;
        }
    }

    get rows(): number { return this.get("rows"); }
    set rows(value: number) { this.set("rows", value); }

    get cols(): number { return this.get("cols"); }
    set cols(value: number) { this.set("cols", value); }

    get savedState(): SavedState { return this.get("savedState"); }
    set savedState(value: SavedState) { this.set("savedState", value); }

    get state(): State { return this.get("state"); }
    set state(value: State) { this.set("state", value); }

    get locTextData(): { [id: string]: string } { return this.get("locTextData"); }
    set locTextData(value: { [id: string]: string }) { this.set("locTextData", value); }

    get currentLanguage(): Utilities.Language { return this.get("currentLanguage"); }
    set currentLanguage(value: Utilities.Language) { this.set("currentLanguage", value); }

    get gridIndex(): number { return this.get("gridIndex"); }
    set gridIndex(value: number) { this.set("gridIndex", value); }

    get noOfGrids(): number { return this.get("noOfGrids"); }
    set noOfGrids(value: number) { this.set("noOfGrids", value); }

    get isRHS(): boolean { return this.get("isRHS"); }
    set isRHS(value: boolean) { this.set("isRHS", value); }

    get hasRHS(): boolean { return this.get("hasRHS"); }
    set hasRHS(value: boolean) { this.set("hasRHS", value); }

    get type(): boolean { return this.get("type"); }
    set type(value: boolean) { this.set("type", value); }

    public defaults() {
        return {
            cols: 1,
            currentLanguage: Utilities.Language.ENGLISH,
            gridIndex: 0,
            isRHS: false,
            locTextData: {},
            noOfGrids: 1,
            rows: 1,
            savedState: {},
            state: State.Enabled
        };
    }

    public setGridLocText(): any {
        const selectedLanguage = this.currentLanguage;
        const getLocText = CommonUtilities.Utilities.getLocText;
        const componentId = "grid";

        this.locTextData = {
            droppable: getLocText(selectedLanguage, componentId, "droppable"),
            droppedDraggable: getLocText(selectedLanguage, componentId, "dropped-draggable-tile"),
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
