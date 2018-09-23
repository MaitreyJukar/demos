import * as Backbone from "backbone";
// tslint:disable-next-line:no-import-side-effect
import "jqueryui";
// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jquery-ui-touch-punch";
import * as _ from "underscore";
import "../../css/shader.styl";
import * as ShaderPkg from "../models/shader";

export interface ExtWindow extends Window {
    BIL: any;
}
declare const window: ExtWindow;

const shaderTemplate: (attr?: any) => string = require("./../../tpl/shader.hbs");
const gridTemplate: (attr?: any) => string = require("./../../tpl/grid.hbs");

export const CELL_SIZE = 25;

export const MIN_VAL = 1;
export const MAX_VAL = 25;

export const COLORS = [
    "yellow",
    "blue",
    "orange",
    "red",
    "gray",
    "white"
];

export const COLOR_REGEX = new RegExp(`(${COLORS.join("|")})`, "g");

export class Cell {
    public row: number;
    public col: number;
    constructor(row: number, col: number) {
        this.col = col;
        this.row = row;
    }
}

export class Shader extends Backbone.View<ShaderPkg.Shader> {

    private _selectedColor: string;
    private _startCell: Cell;
    private _endCell: Cell;
    private _colors: string[];
    private _activeGrid: number;
    private _isAccessibiltyOn: boolean;

    constructor(attr?: Backbone.ViewOptions<ShaderPkg.Shader>) {
        super(attr);
        this._updateModelValuesFromSavedData();
        this._setInitialValues();
        this._setInitialState();
        this._isAccessibiltyOn = !this.model.disabled;
    }

    public events(): Backbone.EventsHash {
        return {
            "blur .grid": this._focusLostFromGrid.bind(this),
            "click .shader-show-me-btn:not([disabled])": this._showOnlyShowMeAnswer.bind(this),
            "click .shader.allow-select.cell-select:not(.disabled) .grid-col": this._onTileClick.bind(this),
            "click .shader.allow-select:not(.disabled) .color-button": this._selectColor.bind(this),
            "click .shader.creation:not(.disabled) .create-grid": this._validateGridSize.bind(this),
            "keydown .grid": this._onKeyDownOnShader.bind(this),
            "mousedown .shader.allow-select:not(.cell-select):not(.disabled) .grid-col": this._onTileMouseDown.bind(this),
            "mousemove .shader.allow-select.dragging:not(.cell-select):not(.disabled) .grid-col": this._onTileMouseMove.bind(this),
            "touchmove .shader.allow-select.dragging:not(.cell-select):not(.disabled) .grid-col": this._onTileTouchMove.bind(this),
            "touchstart .shader.allow-select:not(.cell-select):not(.disabled) .grid-col": this._onTileMouseDown.bind(this)
        };
    }

    public render(): Shader {
        this.$el.html(shaderTemplate(this._getTemplateData()));
        this._renderGrid();
        this._renderSliders();
        this._applyRequiredClasses();
        return this;
    }

    public validate(): boolean {
        const isValid = this._validateGrid();
        const validationClass = isValid ? "correct" : "incorrect";
        if (isValid) {
            this._saveData();
        }
        this._addValidation(validationClass);
        return isValid;
    }

    public showAnswer() {
        this._showAnswer();
        this._saveData();
    }

    public disable() {
        this._disable();
    }

    public enable() {
        this._enable();
    }

    public clearValidation() {
        this._clearValidation();
        this._setInitialState();
    }

    public finish() {
        if (this.model.showMeAns) {
            this._saveData();
            this._disable();
        }
    }

    /** Functions being used from external scripts (exploration.js) */
    public clearColors() {
        this._clearColors();
    }

    private _updateModelValuesFromSavedData() {
        if (this.model.fetchDataType &&
            this.model.savedData) {
            switch (this.model.fetchDataType) {
                case ShaderPkg.SAVE_DATA_TYPES.SHADED_ROW_COL:
                    this._updateModelValuesForShadedRowCol();
                    break;
                case ShaderPkg.SAVE_DATA_TYPES.SHADED_COL:
                    this._updateModelValuesForShadedCol();
                    break;
                case ShaderPkg.SAVE_DATA_TYPES.SHADED_ANY:
                    this._updateModelValuesForShadedAny();
                    break;
                case ShaderPkg.SAVE_DATA_TYPES.CUSTOM:
                    this._updateModelValuesForCustom();
                    break;
                default:
            }
        }
    }

    private _updateModelValuesForShadedRowCol() {
        if (this.model.savedData.type === ShaderPkg.SAVE_DATA_TYPES.SHADED_ROW_COL) {
            const savedData = this.model.savedData;
            this.model.rows = savedData.data.rows;
            this.model.cols = savedData.data.cols;
            this.model.filled = savedData.data.filled;
        }
    }

    private _updateModelValuesForShadedCol() {
        if (this.model.savedData.type === ShaderPkg.SAVE_DATA_TYPES.SHADED_COL) {
            const col = this.model.savedData.data.filledCol;
            this.model.filled.start.col = col;
            this.model.filled.end.col = col;
            this.model.filled.color = "yellow";
        }
    }

    private _updateModelValuesForShadedAny() {
        if (this.model.savedData.type === ShaderPkg.SAVE_DATA_TYPES.SHADED_ANY) {
            this.model.filledData = this.model.savedData.data.filledData;
        }
    }

    private _updateModelValuesForCustom() {
        if (this.model.fetchDataFn) {
            window.BIL.CustomJS[this.model.fetchDataFn](this, this.model);
        }
    }

    private _setInitialValues() {
        if (this.model.colors) {
            // this._colors = COLORS.slice();
            this._colors = this.model.colors.slice();
            this._colors.length = this.model.colors.length;
        }
    }

    private _setInitialState() {
        this.render();
        this._setDefaultState();
        this._renderFromSavedStateValues();
    }

    private _renderGrid() {
        const count = this.model.gridCount ? this.model.gridCount : 1;
        for (let i = 0; i < count; i++) {
            const $grid = $(gridTemplate(this._getTemplateData())).addClass("grid-" + i).attr("data-grid-idx", i);
            this.$(".grid-holder").append($grid);
        }
        if (this.model.numbered) {
            this._numberGridCells();
        }
        if (this.model.type === ShaderPkg.GAME_TYPE.ADDITION) {
            this._renderAdditionData();
        }
    }

    private _numberGridCells() {
        const $gridCells = this.$(".grid-holder").find(".grid-col");
        for (let i = 0; i < $gridCells.length; i++) {
            if (this.model.showNumbers) {
                $gridCells.eq(i).html("<span class='display-digit'>" + (i + 1).toString() + "</span>");
            }
            $gridCells.eq(i).attr("data-number", (i + 1));
        }
        this.$(".grid-holder").find(".grid").addClass("numbered");
    }

    private _renderAdditionData() {
        const $gridCells = this.$(".grid-holder").find(".grid-col");
        for (let i = 0; i < $gridCells.length; i++) {
            const displayDigit = this._getDisplayDigit(i);
            $gridCells.eq(i).html("<span class='display-digit'>" + displayDigit + "</span>");
        }
    }

    private _getDisplayDigit(idx: number): string {
        const cols = this.model.cols;
        // First cell
        if (idx === 0) {
            return "+";
        }
        // First number in each row
        if (idx % cols === 0) {
            return "" + (idx / cols - 1);
        }
        // First number in each col
        if (idx < cols) {
            return "" + (idx - 1);
        }
        // For all others
        return "" + (Math.floor(idx / cols) + idx % cols - 2);
    }

    private _applyRequiredClasses() {
        const classNames = [];
        switch (this.model.type) {
            case ShaderPkg.GAME_TYPE.CREATION:
            case ShaderPkg.GAME_TYPE.SELECTION:
            case ShaderPkg.GAME_TYPE.MULTIPLE:
            case ShaderPkg.GAME_TYPE.COL_SELECTION:
            case ShaderPkg.GAME_TYPE.CELL_SELECT:
                classNames.push("allow-select");
                break;
            case ShaderPkg.GAME_TYPE.ADDITION:
            case ShaderPkg.GAME_TYPE.MULTIPLICATION:
                classNames.push("allow-sliders");
                break;
            case ShaderPkg.GAME_TYPE.DISABLED:
                break;
            default:
        }
        this.$(".shader").addClass(classNames);
    }

    private _getTemplateData() {
        return {
            colors: this._getColors(),
            cols: this.model.cols,
            hslider: this._showHorizontalSlider(),
            labelPrecision: this.model.labelPrecision,
            rows: this.model.rows,
            showMeAns: this.model.showMeAns,
            text: this._getLabels(),
            textboxes: this._showTextBoxes(),
            type: this.model.type,
            validation: this.model.validation,
            vslider: this._showVerticalSlider()
        };
    }

    private _setDefaultState() {
        this._setDefaultSelectedColor();
        if (this.model.disabled) {
            this._disable();
            this._hideButtons();
        }
        if (this.model.filled) {
            this._fillGrid();
        }
        if (this.model.sliderValues) {
            this._setSliderValues();
        }
    }

    private _renderFromSavedStateValues() {
        if (this.model.fetchDataType &&
            this.model.savedData) {
            switch (this.model.fetchDataType) {
                case ShaderPkg.SAVE_DATA_TYPES.SHADED_COL:
                    this._updateSavedStateForShadedCol();
                    break;
                case ShaderPkg.SAVE_DATA_TYPES.SHADED_ANY:
                    this._updateSavedStateForShadedAny();
                    break;
                case ShaderPkg.SAVE_DATA_TYPES.CUSTOM:
                    this._updateSavedStateForCustom();
                    break;
                default:
            }
        }
    }

    private _updateSavedStateForShadedCol() {
        const col = this.model.savedData.data.filledCol;
        this.$(`.grid-holder .grid-col[data-col=${col}]`).addClass("prev-selected");
        this.$(`.grid-holder .grid-col:not([data-col=${col}])`).addClass("not-to-be-selected");
    }

    private _updateSavedStateForShadedAny() {
        const savedData = this.model.filledData;
        const startCell: Cell = {
            col: 0,
            row: 0
        };
        const endCell: Cell = {
            col: this.model.cols - 1,
            row: this.model.rows - 1
        };
        this._forEachCell(startCell, endCell, (row, col) => {
            const currCellData = this.model.filledData[row][col];
            if (currCellData && currCellData.color) {
                this._getElementFromCell({ row, col }).addClass(`filled ${currCellData.color}`);
            }
        });
    }

    private _updateSavedStateForCustom() {
        if (this.model.viewUpdateFn) {
            window.BIL.CustomJS[this.model.viewUpdateFn](this, this.model);
        }
    }

    private _setSliderValues() {
        const step = this.model.sliderValues.step;
        this._setVerticalSliderValue(+(this.model.sliderValues.vertical / step).toFixed(10));
        this._setHorizontalSliderValue(+(this.model.sliderValues.horizontal / step).toFixed(10));
    }

    private _fillGrid() {
        const color = this.model.filled.color;
        if (this.model.filled.type == "column") {
            const values = this.model.filled.values;
            for (const val of values) {
                this._forEachCellColWise(
                    {
                        col: (val - 1),
                        row: 0
                    }, {
                        col: (val - 1),
                        row: this.model.rows
                    }, this._fillColor.bind(this, color)
                );
            }
        } else {
            if (this.model.filled.multiple) {
                for (const val of this.model.filled.values) {
                    this._forEachCell(val.start, val.end, this._fillColor.bind(this, color));
                }
            } else {
                this._forEachCell(this.model.filled.start, this.model.filled.end, this._fillColor.bind(this, color));
            }
        }
    }

    private _setDefaultSelectedColor() {
        if (this._isColorGrid()) {
            const colorIdx = this.model.selectedColorIdx;
            this._selectedColor = this.model.colors[colorIdx];
            this.$(`.color-button.btn-${this._selectedColor}`).addClass("selected");
        }
    }

    private _getColors() {
        return this._isColorGrid() ? this._colors : null;
    }

    private _isColorGrid() {
        return this.model.type === ShaderPkg.GAME_TYPE.SELECTION ||
            this.model.type === ShaderPkg.GAME_TYPE.CREATION ||
            this.model.type === ShaderPkg.GAME_TYPE.MULTIPLE ||
            this.model.type === ShaderPkg.GAME_TYPE.COL_SELECTION ||
            this.model.type === ShaderPkg.GAME_TYPE.CELL_SELECT;
    }

    private _showVerticalSlider() {
        return this.model.type === ShaderPkg.GAME_TYPE.MULTIPLICATION ||
            this.model.type === ShaderPkg.GAME_TYPE.ADDITION;
    }

    private _showHorizontalSlider() {
        return [
            ShaderPkg.GAME_TYPE.MULTIPLICATION,
            ShaderPkg.GAME_TYPE.ADDITION,
            ShaderPkg.GAME_TYPE.ARROWS
        ].indexOf(this.model.type) > -1;
    }

    private _showTextBoxes() {
        return this.model.type === ShaderPkg.GAME_TYPE.CREATION;
    }

    private _getLabels() {
        return {
            createGrid: "Create Grid",
            createGridLabel: "Create a grid of your choice.",
            errorLabel: "Enter a number between 1 and 25.",
            validate: "Validate"
        };
    }

    private _renderSliders() {
        if (this._showHorizontalSlider()) {
            const $horizontalSlider = this.$(".horizontal-slider");
            const precision = this.model.labelPrecision;
            this.$(".horizontal-slider").slider({
                change: this._onHSlide.bind(this),
                max: this.model.cols,
                min: this._getSliderMinValue(),
                range: "min",
                slide: this._onHSlide.bind(this),
                step: 1,
                value: this._getSliderMinValue()
            }).each((idx: number, elem: HTMLElement) => {
                const opt = $(elem).data().uiSlider.options;
                const vals = opt.max - opt.min;
                for (let i = 0; i <= vals; i++) {
                    const el = $("<label>" + (i + opt.min) / precision + "</label>").css("left", (i / vals * 100) + "%");
                    const pipEl = $("<div></div>").addClass("pip-vertical").css("left", (i / vals) * 100 + "%");
                    $horizontalSlider.append(el);
                    $horizontalSlider.append(pipEl);
                }
            });
            this.$(".horizontal-slider").css({
                width: (this.model.cols - this._getSliderMinValue()) * CELL_SIZE
            });
            this._handleHorzSlide(this._getSliderMinValue());
        }
        if (this._showVerticalSlider()) {
            const $verticalSlider = this.$(".vertical-slider");
            const precision = this.model.labelPrecision;
            this.$(".vertical-slider").slider({
                change: this._onVSlide.bind(this),
                max: this.model.rows,
                min: this._getSliderMinValue(),
                orientation: "vertical",
                range: "min",
                slide: this._onVSlide.bind(this),
                step: 1,
                value: this.model.rows
            }).each((idx: number, elem: HTMLElement) => {
                const opt = $(elem).data().uiSlider.options;
                const vals = opt.max - opt.min;
                for (let i = 0; i <= vals; i++) {
                    const el = $("<label>" + (i + opt.min) / precision + "</label>").css("top", (i / vals * 100) + "%");
                    const pipEl = $("<div></div>").addClass("pip-horizontal").css("top", (i / vals) * 100 + "%");
                    $verticalSlider.append(el);
                    $verticalSlider.append(pipEl);
                }
            });
            this.$(".vertical-slider").css({
                height: (this.model.rows - this._getSliderMinValue()) * CELL_SIZE
            });
            this._handleVertSlide(this.model.rows);
        }
    }

    private _getSliderMinValue() {
        return this.model.type === ShaderPkg.GAME_TYPE.ADDITION ? 2 : 0;
    }

    private _onHSlide(event: JQueryEventObject, ui: any) {
        this._handleHorzSlide(ui.value);
        this._triggerChange();
    }

    private _handleHorzSlide(val: number) {
        if (this.model.type === ShaderPkg.GAME_TYPE.ADDITION) {
            this._updateHorizontalAddition(val);
        } else {
            this._updateHorizontalGridSelection(val);
        }
    }

    private _updateHorizontalAddition(val: number) {
        const fillCol = val - 1;
        const $cell = this.$("[data-col=" + fillCol + "].grid-col");
        this.$(".grid-col").removeClass("hfill");
        this.$(".grid-row").removeClass("rowfill");
        $cell.addClass("hfill");
        $cell.closest(".grid-row").addClass("rowfill");
    }

    private _updateHorizontalGridSelection(val: number) {
        this.$(".grid-col").removeClass("hfill");
        const fillUpto = val;
        for (let i = 0; i < fillUpto; i++) {
            this.$("[data-col=" + i + "].grid-col").addClass("hfill");
        }
    }

    private _onVSlide(event: JQueryEventObject, ui: any) {
        this._handleVertSlide(ui.value);
        this._triggerChange();
    }

    private _handleVertSlide(val: number) {
        if (this.model.type === ShaderPkg.GAME_TYPE.ADDITION) {
            this._updateVerticalAddition(val);
        } else {
            this._updateVerticalGridSelection(val);
        }
    }

    private _updateVerticalAddition(val: number) {
        const fillRow = (this.model.rows - val + this._getSliderMinValue()) - 1;
        const $row = this.$("[data-row=" + fillRow + "]");
        this.$(".grid-col").removeClass("vfill");
        this.$(".grid-row").removeClass("colfill");
        $(".grid-col", $row).addClass("vfill");
        $row.addClass("colfill");
    }

    private _updateVerticalGridSelection(val: number) {
        this.$(".grid-col").removeClass("vfill");
        const fillUpto = this.model.rows - val + this._getSliderMinValue();
        for (let i = 0; i < fillUpto; i++) {
            this.$("[data-row=" + i + "] .grid-col").addClass("vfill");
        }
    }

    private _onTileClick(evt: JQueryEventObject) {
        const $target = $(evt.target);
        const row = parseInt($target.closest("[data-row]").attr("data-row"), 10);
        const col = parseInt($target.closest("[data-col]").attr("data-col"), 10);
        const activeGrid = parseInt($target.closest(".grid").data("grid-idx"), 10);
        this._colorCell(activeGrid, row, col);
        this._triggerChange();
    }

    private _onTileMouseDown(evt: JQueryEventObject) {
        const $target = $(evt.target);
        const row = parseInt($target.closest("[data-row]").attr("data-row"), 10);
        const col = parseInt($target.closest("[data-col]").attr("data-col"), 10);
        const activeGrid = parseInt($target.closest(".grid").data("grid-idx"), 10);
        if (this.model.type === ShaderPkg.GAME_TYPE.COL_SELECTION) {
            this._startCell = new Cell(0, col);
            this._endCell = new Cell(this.model.rows - 1, col);
        } else {
            this._startCell = new Cell(row, col);
            this._endCell = new Cell(row, col);
        }
        this._activeGrid = activeGrid;
        this.$(".shader").addClass(this._selectedColor + "-select dragging");

        $(window).on("mouseup.dragging touchend.dragging", this._onDraggingEnd.bind(this));
    }

    private _onKeyDownOnShader(evt: JQueryEventObject) {
        if (this._isAccessibiltyOn) {
            const keycode = evt.which;
            switch (keycode) {
                // on escape focus back to outer container
                case 27:
                    if (this.$el.find(".focused").length != 0) {
                        const prevFocused = this.$el.find(".focused");
                        prevFocused.removeClass("focused");
                    }
                    break;
                case 37:
                case 38:
                case 39:
                case 40:
                    if (this.$el.find(".focused").length != 0) {
                        const prevFocused = this.$el.find(".focused");
                        const colNo = parseInt(prevFocused.attr("data-col"), 10);
                        const rowNo = parseInt(prevFocused.parent().attr("data-row"), 10);
                        let newRow = rowNo;
                        let newCol = colNo;
                        const maxCol = this.model.cols - 1;
                        const maxRow = this.model.rows - 1;
                        if (keycode == 37) {    // Handle Left Arrow Key
                            if (colNo == 0) {
                                newRow = rowNo - 1 < 0 ? 0 : rowNo - 1;
                                newCol = rowNo - 1 < 0 ? colNo : 9;
                            } else {
                                newCol = colNo - 1;
                            }
                        } else if (keycode == 39) { // Handle Right Arrow Key
                            if (colNo == maxCol) {
                                newRow = rowNo + 1 > maxRow ? maxRow : rowNo + 1;
                                newCol = rowNo + 1 > maxRow ? colNo : 0;
                            } else {
                                newCol = colNo + 1;
                            }
                        } else if (keycode == 38) { // Handle UP Arrow Key
                            newRow = rowNo - 1 < 0 ? 0 : rowNo - 1;
                        } else if (keycode == 40) { // Handle DOWN Arrow Key
                            newRow = rowNo + 1 > maxRow ? maxRow : rowNo + 1;
                        }
                        this.$el.find("[data-row='" + newRow + "']").find("[data-col='" + newCol + "']").addClass("focused");
                        if (rowNo != newRow || colNo != newCol) {
                            prevFocused.removeClass("focused");
                        }
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                    break;
                case 13:
                case 32:
                    if (this.$el.find(".focused").length != 0) {    // Apply color to Selected Cell
                        const prevFocused = this.$el.find(".focused");
                        const $target = $(evt.target);
                        const colNo = parseInt(prevFocused.attr("data-col"), 10);
                        const rowNo = parseInt(prevFocused.parent().attr("data-row"), 10);
                        const activeGrid = parseInt($target.closest(".grid").data("grid-idx"), 10);
                        this._colorCell(activeGrid, rowNo, colNo);
                    } else if ($(evt.target).hasClass("grid")) {    // Give focsu to 0th Cell
                        const tempEl = this.$el.find("[data-row=0]").find("[data-col=0]");
                        tempEl.addClass("focused");
                    }
                    evt.stopPropagation();
                    evt.preventDefault();
            }
        }
    }

    private _focusLostFromGrid() {
        if (this.$el.find(".focused").length != 0) {
            const prevFocused = this.$el.find(".focused");
            prevFocused.removeClass("focused");
        }
    }

    private _onDraggingEnd() {
        $(window).off(".dragging");
        if (this._startCell && this._endCell) {
            this._forEachCell(this._startCell, this._endCell, this._colorCell.bind(this, this._activeGrid));
        }
        this._startCell = null;
        this._endCell = null;
        this._activeGrid = null;
        this.$(".shader").removeClass(this._selectedColor + "-select dragging");
        this._clearSelection();
        this._triggerChange();
    }

    private _onTileMouseMove(evt: JQueryEventObject) {
        evt.preventDefault();
        const $target = $(evt.target);
        this._selectCellOnMove($target);
    }

    private _onTileTouchMove(evt: TouchEvent) {
        evt.preventDefault();
        const $target = $(document.elementFromPoint(evt.touches[0].pageX, evt.touches[0].pageY));
        if ($target.hasClass("grid-col")) {
            this._selectCellOnMove($target);
        }
    }

    private _selectCellOnMove($target: JQuery<HTMLElement>) {
        const activeGrid = parseInt($target.closest(".grid").data("grid-idx"), 10);
        if (activeGrid === this._activeGrid) {
            const row = this.model.type === ShaderPkg.GAME_TYPE.COL_SELECTION ? this.model.rows - 1 : this._getRowNoFromCell($target);
            const col = this._getColNoFromCell($target);
            this._endCell = new Cell(row, col);
            this._renderSelection(this._startCell, this._endCell, activeGrid);
        }
    }

    private _getRowNoFromCell(cell: HTMLElement | JQuery<HTMLElement>): number {
        return parseInt($(cell).closest("[data-row]").attr("data-row"), 10);
    }

    private _getColNoFromCell(cell: HTMLElement | JQuery<HTMLElement>): number {
        return parseInt($(cell).closest("[data-col]").attr("data-col"), 10);
    }

    private _renderSelection(start: Cell, end: Cell, gridIdx: number) {
        this._clearSelection();
        this._forEachCell(start, end, this._selectCell.bind(this, gridIdx));
    }

    private _selectCell(gridIdx: number, row: number, col: number) {
        this._getElementFromCellAndGrid({
            col,
            row
        }, gridIdx).addClass("selecting");
    }

    private _colorCell(gridIdx: number, row: number, col: number) {
        const classesToAdd: string[] = [];
        if (this._selectedColor !== "white") {
            classesToAdd.push(this._selectedColor, "filled");
        }

        this._getElementFromCellAndGrid({
            col,
            row
        }, gridIdx).removeClass(COLORS).removeClass("filled").addClass(classesToAdd);
    }

    private _forEachCell(from: Cell, to: Cell, cb: (row: number, col: number) => any) {
        const { rowMax, rowMin, colMax, colMin } = this._getRowColEdges(from, to);
        for (let cRow = rowMin; cRow <= rowMax; cRow++) {
            for (let cCol = colMin; cCol <= colMax; cCol++) {
                cb(cRow, cCol);
            }
        }
    }

    private _forEachCellRowWise(from: Cell, to: Cell, cb: (row: number, col: number) => any) {
        const rowMax = to.row;
        const rowMin = from.row;
        const colMax = to.col;
        const colMin = from.col;
        for (let cRow = rowMin; cRow <= rowMax; cRow++) {
            const cStart = cRow === rowMin ? colMin : 0;
            const cMax = cRow === rowMax ? colMax : (this.model.cols - 1);
            for (let cCol = cStart; cCol <= cMax; cCol++) {
                cb(cRow, cCol);
            }
        }
    }

    private _forEachCellColWise(from: Cell, to: Cell, cb: (row: number, col: number) => any) {
        const rowMax = to.row;
        const rowMin = from.row;
        const colMax = to.col;
        const colMin = from.col;
        for (let cCol = colMin; cCol <= colMax; cCol++) {
            const rStart = cCol === colMin ? rowMin : 0;
            const rMax = cCol === colMax ? rowMax : (this.model.rows - 1);
            for (let cRow = rStart; cRow <= rMax; cRow++) {
                cb(cRow, cCol);
            }
        }
    }

    private _getRowColEdges(start: Cell, end: Cell) {
        return {
            colMax: Math.max(start.col, end.col),
            colMin: Math.min(start.col, end.col),
            rowMax: Math.max(start.row, end.row),
            rowMin: Math.min(start.row, end.row)
        };
    }

    private _getElementFromCell(cell: Cell) {
        return this.$("[data-row=" + cell.row + "] .grid-col[data-col=" + cell.col + "]");
    }

    private _getElementFromCellAndGrid(cell: Cell, grid: number) {
        return this.$(".grid[data-grid-idx=" + grid + "] [data-row=" + cell.row + "] .grid-col[data-col=" + cell.col + "]");
    }

    private _clearSelection(gridIdx = 0) {
        this.$(".grid-col").removeClass("selecting");
    }

    private _clearGridSelection(gridIdx = 0) {
        this.$(".grid[data-grid-idx=" + gridIdx + "] .grid-col").removeClass("selecting");
    }

    private _clearColors() {
        this.$(".grid-col").removeClass(COLORS).removeClass("filled");
    }

    private _clearGridColor(gridIdx = 0) {
        this.$(".grid[data-grid-idx=" + gridIdx + "] .grid-col").removeClass(COLORS).removeClass("filled");
    }

    private _selectColor(evt: JQueryEventObject) {
        const $target = $(evt.currentTarget);
        this.$(".color-button").removeClass("selected");
        $target.addClass("selected");
        this._selectedColor = $target.data("value");
    }

    private _validateGrid(): boolean {
        const VALIDATION_TYPES = ShaderPkg.VALIDATION_TYPES;
        switch (this.model.validationType) {
            case VALIDATION_TYPES.COUNT:
                return this._validateCount();
            case VALIDATION_TYPES.COUNT_COLOR:
                return this._validateColorCount();
            case VALIDATION_TYPES.COUNT_COLOR_IN_COL:
                return this._validateCountColorInCol();
            case VALIDATION_TYPES.DIVIDE:
                return this._validateDivide();
            case VALIDATION_TYPES.PRODUCT:
                return this._validateProduct();
            case VALIDATION_TYPES.DIVIDE_COLOR:
                return this._validateDivideColor();
            case VALIDATION_TYPES.COUNT_ANY:
                return this._validateCountAny();
            case VALIDATION_TYPES.MULTI_SELECT:
                return this._validateMultiSelect();
            case VALIDATION_TYPES.NUMBERED:
                return this._validateNumberedSelect();
            case VALIDATION_TYPES.COLUMN:
                return this._validateColumns();
            case VALIDATION_TYPES.COLUMN_ANY:
                return this._validateColumnAny();
            case VALIDATION_TYPES.FRACTION:
                return this._validateFraction();
            case VALIDATION_TYPES.MULTIPLES:
                return this._validateMultiples();
            case VALIDATION_TYPES.ROW_SELECT:
                return this._validateRows();
            case VALIDATION_TYPES.CELL_SELECT:
                return this._validateCells();
            case VALIDATION_TYPES.CUSTOM:
                return this._validateCustom();
        }
        return false;
    }

    private _validateCount(): boolean {
        const $selectedCells = this.$(".grid-col.filled");
        if ($selectedCells.length === this.model.validationData.value) {
            let prevCol = null;
            let prevRow = null;
            let rowSame = true;
            let colSame = true;
            let valid = true;

            for (const cell of $selectedCells) {
                const col = this._getColNoFromCell(cell);
                const row = this._getRowNoFromCell(cell);
                prevCol = prevCol === null ? col : prevCol;
                prevRow = prevRow === null ? row : prevRow;
                rowSame = rowSame && (prevRow === row);
                colSame = colSame && (prevCol === col);
                if (!colSame && !rowSame) {
                    valid = false;
                    break;
                }
            }
            return valid;
        }
        return false;
    }

    private _validateColorCount(): boolean {
        const colors = this.model.validationData.value;
        let valid = true;
        for (const color of colors) {
            valid = valid && this.$(".grid-col.filled." + this._getColors()[color.color]).length === color.count;
            if (!valid) {
                break;
            }
        }
        return valid;
    }

    private _validateCountColorInCol(): boolean {
        const colors = this.model.validationData.value;
        let valid = true;
        for (const color of colors) {
            valid = valid && this.$(".grid-col.filled." + this._getColors()[color.color]).length === color.count;
            if (!valid) {
                break;
            }
        }
        return valid;
    }

    private _validateDivide(): boolean {
        const divisor = this.model.validationData.value.divisor;
        const dividend = this.model.validationData.value.dividend;
        const $selectedCells = this.$(".grid-col.filled");
        if ($selectedCells.length === dividend) {
            if (this.$(".grid-col.filled." + this._getColors()[0]).length === dividend) {
                return true;
            } else if (this.$(".grid-col.filled." + this._getColors()[1]).length === dividend) {
                return true;
            } else if ((dividend / divisor) > 10) {
                if (this.$(".grid-col.filled." + this._getColors()[0]).length === (divisor * 10) &&
                    this.$(".grid-col.filled." + this._getColors()[1]).length === divisor * (dividend / divisor - 10)) {
                    return true;
                } else if (this.$(".grid-col.filled." + this._getColors()[1]).length === (divisor * 10) &&
                    this.$(".grid-col.filled." + this._getColors()[0]).length === divisor * (dividend / divisor - 10)) {
                    return true;
                }
            }
        }
        return false;
    }

    private _validateProduct() {
        const step = this.model.validationData.value.step;
        const horzVal = +(step * this._getHorizontalSliderValue()).toFixed(10);
        const vertVal = +(step * this._getVerticalSliderValue()).toFixed(10);
        const value1 = this.model.validationData.value.values[0];
        const value2 = this.model.validationData.value.values[1];
        return (horzVal === value1 && vertVal === value2) || (horzVal === value2 && vertVal === value1);
    }

    private _validateDivideColor(): boolean {
        const $selectedCells = this.$(".grid-col.filled");
        const dividend = this.model.validationData.value.dividend;
        const divisor = this.model.validationData.value.divisor;
        const precision = this.model.validationData.value.precision;
        if ($selectedCells.length === dividend * precision) {
            return this._checkAlternatingColors(divisor, dividend * precision);
        }
        return false;
    }

    private _validateCountAny(): boolean {
        return this.$(".grid-col.filled").length === this.model.validationData.value;
    }

    private _validateMultiSelect(): boolean {
        const $selectedCells = this.$(".grid-col.filled");
        const total = this.model.validationData.value.total;
        if ($selectedCells.length === total) {
            let isValid = true;
            const gridArea = this.model.rows * this.model.cols;
            const gridsToColor = Math.ceil(total / gridArea);
            for (let i = 0; i < gridsToColor; i++) {
                const selectedCount = this.$(".grid[data-grid-idx=" + i + "] .grid-col.filled").length;
                const toBeColored = (i === gridsToColor - 1) ? total - gridArea * i : gridArea;
                isValid = isValid && selectedCount === toBeColored;
            }
            return isValid;
        }
        return false;
    }

    private _validateNumberedSelect(): boolean {
        const values = this.model.validationData.values;
        const color = this.model.validationData.color;
        let isValid = true;
        const $gridCells = this.$(".grid-holder").find(".grid-col.filled." + this._getColors()[color]);
        for (const valueSet of values) {
            isValid = true;
            if ($gridCells.length == (valueSet.end - valueSet.start + 1)) {
                for (let i = 0; i < $gridCells.length; i++) {
                    const no = parseInt($gridCells.eq(i).attr("data-number"), 10);
                    if ((no < valueSet.start) || (no > valueSet.end)) {
                        isValid = false;
                        break;
                    }
                }
                if (isValid) {
                    break;
                }
            } else {
                isValid = false;
            }
        }
        return isValid;
    }

    private _validateColumns(): boolean {
        const values = this.model.validationData.values;
        const color = this.model.validationData.color;
        let isValid = true;
        const $gridCells = this.$(".grid-holder").find(".grid-col.filled." + this._getColors()[color]);
        const cellValues: number[] = [];
        for (const val of values) {
            for (let i = 1; i <= this.model.rows; i++) {
                cellValues.push(val + ((i - 1) * this.model.cols));
            }
        }
        if ($gridCells.length == cellValues.length) {
            for (let i = 0; i < $gridCells.length; i++) {
                const no = parseInt($gridCells.eq(i).attr("data-number"), 10);
                if (cellValues.indexOf(no) == -1) {
                    isValid = false;
                    break;
                }
            }
        } else {
            isValid = false;
        }
        return isValid;
    }

    private _validateColumnAny(): boolean {
        const colCount = this.model.validationData.count;
        let isValid = true;
        const $gridCells = this.$(".grid-holder .grid-col.filled");
        if ($gridCells.length == colCount * this.model.rows) {
            let currCol = parseInt($gridCells.eq(0).attr("data-col"), 10);
            for (let i = 0; i < colCount;) {
                const $colCells = this.$(`.grid-holder .grid-col[data-col=${currCol}]`);
                const $filledColCells = this.$(`.grid-holder .grid-col.filled[data-col=${currCol}]`);
                isValid = isValid && ($colCells.length === $filledColCells.length);
                if (isValid) {
                    i++;
                    currCol = parseInt($gridCells.eq(i * this.model.rows).attr("data-col"), 10);
                } else {
                    return isValid;
                }
            }
        } else {
            isValid = false;
        }
        return isValid;
    }

    private _validateFraction(): boolean {
        const $selectedCells = this.$(".grid-col.filled");
        if ($selectedCells.length === this.model.validationData.value * this.model.gridCount) {
            let isValid = true;
            for (let i = 0; i < this.model.gridCount; i++) {
                const selectedCount = this.$(".grid[data-grid-idx=" + i + "] .grid-col.filled").length;
                isValid = isValid && selectedCount === this.model.validationData.value;
            }
            return isValid;
        }
        return false;
    }

    private _validateMultiples(): boolean {
        const value = this.model.validationData.value;
        const color = this.model.validationData.color;
        let isValid = true;
        const $gridCells = this.$(".grid-holder").find(".grid-col.filled." + this._getColors()[color]);
        const coloredCellCount = $gridCells.length;
        const totalCells = this.model.rows * this.model.cols;
        if ((totalCells / value) == coloredCellCount) {
            for (let i = 0; i < $gridCells.length; i++) {
                const no = parseInt($gridCells.eq(i).attr("data-number"), 10);
                if (no % value !== 0) {
                    isValid = false;
                    break;
                }
            }
        } else {
            isValid = false;
        }
        return isValid;
    }

    private _validateRows(): boolean {
        let isValid = true;
        const values = this.model.validationData.values;
        const color = this.model.validationData.color;
        const $gridCells = this.$(".grid-holder").find(".grid-col.filled." + this._getColors()[color]);
        const cellValues: number[] = [];
        // If total colored cells !== values.length * this.model.cols
        // return false
        if ($gridCells.length !== values.length * this.model.cols) {
            return false;
        }
        for (const row of values) {
            const $row = this.$(`.grid-holder .grid-row[data-row='${row - 1}']`);
            isValid = isValid && ($(".grid-col", $row).length === $(".grid-col.filled", $row).length);
            if (!isValid) {
                break;
            }
        }
        return isValid;
    }

    private _validateCells(): boolean {
        let isValid = true;
        const values = this.model.validationData.values;
        const color = this.model.validationData.color;
        const $gridCells = this.$(".grid-holder").find(".grid-col.filled." + this._getColors()[color]);
        if ($gridCells.length !== values.length) {
            return false;
        }
        for (const cell of $gridCells) {
            isValid = isValid && (values.includes(parseInt(cell.getAttribute("data-number"), 10)));
        }
        return isValid;
    }

    private _validateCustom(): boolean {
        if (this.model.validationFn) {
            return window.BIL.CustomJS[this.model.validationFn](this, this.model);
        }
        return false;
    }

    private _fillAlternatingColors(groups: number, count: number, vertical: boolean) {
        const colors = this._getColors().slice();
        const groupSize = count / groups;

        for (let i = 0; i < groups; i++) {
            if (vertical) {
                this._forEachCellColWise(
                    {
                        col: Math.floor((i * groupSize) / this.model.rows),
                        row: (i * groupSize) % this.model.rows
                    }, {
                        col: Math.floor(((i + 1) * groupSize - 1) / this.model.rows),
                        row: ((i + 1) * groupSize - 1) % this.model.rows
                    }, this._fillColor.bind(this, colors[i % 2])
                );
            } else {
                this._forEachCellRowWise(
                    {
                        col: (i * groupSize) % this.model.cols,
                        row: Math.floor((i * groupSize) / this.model.cols)
                    }, {
                        col: ((i + 1) * groupSize - 1) % this.model.cols,
                        row: Math.floor(((i + 1) * groupSize - 1) / this.model.cols)
                    }, this._fillColor.bind(this, colors[i % 2])
                );
            }
        }
    }

    private _checkAlternatingColors(groups: number, count: number): boolean {
        const colors = this._getColors();
        const $selectedCells = this.$(".grid-col.filled");
        const $first = $($selectedCells[0]);
        const colorsToCheck = [];
        const flags = {
            colWise: true,
            rowWise: true
        };
        const groupSize = count / groups;
        if ($first.hasClass(colors[0])) {
            colorsToCheck.push(colors[0], colors[1]);
        } else if ($first.hasClass(colors[1])) {
            colorsToCheck.push(colors[1], colors[0]);
        } else {
            return false;
        }
        for (let i = 0; i < groups; i++) {
            this._forEachCellRowWise(
                {
                    col: (i * groupSize) % this.model.cols,
                    row: Math.floor((i * groupSize) / this.model.cols)
                }, {
                    col: ((i + 1) * groupSize - 1) % this.model.cols,
                    row: Math.floor(((i + 1) * groupSize - 1) / this.model.cols)
                }, this._checkColor.bind(this, colorsToCheck[i % 2], flags, "rowWise")
            );
            if (!flags.rowWise) {
                this._forEachCellColWise(
                    {
                        col: Math.floor((i * groupSize) / this.model.rows),
                        row: (i * groupSize) % this.model.rows
                    }, {
                        col: Math.floor(((i + 1) * groupSize - 1) / this.model.rows),
                        row: ((i + 1) * groupSize - 1) % this.model.rows
                    }, this._checkColor.bind(this, colorsToCheck[i % 2], flags, "colWise")
                );
            }
            return flags.rowWise || flags.colWise;
        }
        return false;
    }

    private _checkColor(color: string, flags: any, flag: string, row: number, col: number) {
        flags[flag] = flags[flag] && this._getElementFromCell({
            col,
            row
        }).hasClass(color);
    }

    private _getHorizontalSliderValue() {
        return this.$(".horizontal-slider").slider("value");
    }

    private _getVerticalSliderValue() {
        const $verticalSlider = this.$(".vertical-slider");
        const sliderVal = $verticalSlider.length ? $verticalSlider.slider("value") : 0;
        return this.model.rows - sliderVal;
    }

    private _setHorizontalSliderValue(val: number) {
        this.$(".horizontal-slider").slider("value", val);
    }

    private _setVerticalSliderValue(val: number) {
        this.$(".vertical-slider").slider("value", this.model.rows - val);
    }

    private _showAnswer() {
        this._clearValidation();
        const VALIDATION_TYPES = ShaderPkg.VALIDATION_TYPES;
        switch (this.model.validationType) {
            case VALIDATION_TYPES.COUNT:
                return this._showAnswerForCount();
            case VALIDATION_TYPES.COUNT_COLOR:
                return this._showAnswerForColorCount();
            case VALIDATION_TYPES.COUNT_COLOR_IN_COL:
                return this._showAnswerForCountColorInCol();
            case VALIDATION_TYPES.DIVIDE:
                return this._showAnswerForDivide();
            case VALIDATION_TYPES.PRODUCT:
                return this._showAnswerForProduct();
            case VALIDATION_TYPES.DIVIDE_COLOR:
                return this._showAnswerForDivideColor();
            case VALIDATION_TYPES.COUNT_ANY:
                return this._showAnswerForCountAny();
            case VALIDATION_TYPES.MULTI_SELECT:
                return this._showAnswerForMultiSelect();
            case VALIDATION_TYPES.NUMBERED:
                return this._showAnswerForNumberedSelect();
            case VALIDATION_TYPES.COLUMN:
                return this._showAnswerForColumnSelect();
            case VALIDATION_TYPES.COLUMN_ANY:
                return this._showAnswerForColumnAny();
            case VALIDATION_TYPES.FRACTION:
                return this._showAnswerForFraction();
            case VALIDATION_TYPES.MULTIPLES:
                return this._showAnswerForMultiples();
            case VALIDATION_TYPES.ROW_SELECT:
                return this._showAnswerForRows();
            case VALIDATION_TYPES.CELL_SELECT:
                return this._showAnswerForCells();
            case VALIDATION_TYPES.CUSTOM:
                return this._showAnswerForCustom();
        }
    }

    private _showAnswerForCount() {
        this._clearColors();
        this._forEachCell(
            {
                col: 0,
                row: 0
            },
            {
                col: this.model.validationData.value - 1,
                row: 0
            }, this._fillColor.bind(this, this._getColors()[0])
        );
    }

    private _showAnswerForColorCount() {
        this._clearColors();

        const colors = this.model.validationData.value;
        const cell = new Cell(0, 0);
        const vertical = this.model.rows > this.model.cols;
        for (const color of colors) {
            if (vertical) {
                this._forEachCell(
                    cell,
                    {
                        col: 0,
                        row: cell.row + color.count - 1
                    }, this._fillColor.bind(this, this._getColors()[color.color])
                );
                cell.row += color.count;
            } else {
                this._forEachCell(
                    cell,
                    {
                        col: cell.col + color.count - 1,
                        row: 0
                    }, this._fillColor.bind(this, this._getColors()[color.color])
                );
                cell.col += color.count;
            }
        }
    }

    private _showAnswerForCountColorInCol() {
        this._clearColors();

        const colors = this.model.validationData.value;
        this._fillColor(this._getColors()[colors[0].color], this.model.rows - 1, this.model.savedData.data.filledCol);
    }

    private _showAnswerForDivide() {
        this._clearColors();

        const divisor = this.model.validationData.value.divisor;
        const dividend = this.model.validationData.value.dividend;
        this._forEachCell(
            {
                col: 0,
                row: 0
            }, {
                col: divisor - 1,
                row: dividend / divisor - 1
            }, this._fillColor.bind(this, this._getColors()[0]));
    }

    private _showAnswerForProduct() {
        const step = this.model.validationData.value.step;
        const value1 = this.model.validationData.value.values[0];
        const value2 = this.model.validationData.value.values[1];
        this._setHorizontalSliderValue(value1 / step);
        this._setVerticalSliderValue(value2 / step);
    }

    private _showAnswerForDivideColor() {
        this._clearColors();
        const dividend = this.model.validationData.value.dividend;
        const divisor = this.model.validationData.value.divisor;
        const precision = this.model.validationData.value.precision;
        this._fillAlternatingColors(divisor, dividend * precision, this.model.validationData.value.vertical);
    }

    private _showAnswerForCountAny() {
        this._clearColors();
        this.$(".grid-col").slice(0, this.model.validationData.value).addClass(this._getColors()[0]);
    }

    private _showAnswerForMultiSelect() {
        this._clearColors();
        const total = this.model.validationData.value.total;
        const gridArea = this.model.rows * this.model.cols;
        const gridsToColor = Math.ceil(total / gridArea);
        for (let i = 0; i < gridsToColor; i++) {
            if (i === gridsToColor - 1) {
                this._forEachCellRowWise(
                    {
                        col: 0,
                        row: 0
                    }, {
                        col: ((total - gridArea * i) % this.model.cols) - 1,
                        row: Math.floor((total - gridArea * i) / this.model.cols)
                    }, (row: number, col: number) => {
                        this._getElementFromCellAndGrid({ row, col }, i).addClass([this._getColors()[0], "filled"]);
                    }
                );
            } else {
                this.$(".grid[data-grid-idx=" + i + "] .grid-col").addClass([this._getColors()[0], "filled"]);
            }
        }
    }

    private _showAnswerForNumberedSelect() {
        this._clearColors();

        const color = this.model.validationData.color;
        const values = this.model.validationData.values[0];
        for (let i = values.start; i <= values.end; i++) {
            this.$(".grid-col[data-number=" + i + "]").addClass([this._getColors()[color], "filled"]);
        }
        if (this.model.filled && this.model.filled.clearFilled == false) {
            this._fillGrid();
        }
    }

    private _showAnswerForColumnSelect() {
        this._clearColors();

        const values = this.model.validationData.values;
        for (const val of values) {
            this._forEachCellColWise(
                {
                    col: (val - 1),
                    row: 0
                }, {
                    col: (val - 1),
                    row: this.model.rows
                }, this._fillColor.bind(this, this._getColors()[0])
            );
        }
    }

    private _showAnswerForColumnAny() {
        this._clearColors();

        const count = this.model.validationData.count;
        for (let i = 0; i < count; i++) {
            this._forEachCellColWise(
                {
                    col: i,
                    row: 0
                }, {
                    col: i,
                    row: this.model.rows
                }, this._fillColor.bind(this, this._getColors()[0])
            );
        }
    }

    private _showAnswerForFraction() {
        this._clearColors();
        const color = this.model.validationData.color;
        for (let i = 0; i <= this.model.gridCount; i++) {
            this.$(".grid[data-grid-idx=" + i + "] .grid-col").slice(0, this.model.validationData.value)
                .addClass([this._getColors()[color], "filled"]);
        }
    }

    private _showAnswerForMultiples() {
        this._clearColors();
        const color = this.model.validationData.color;
        const value = this.model.validationData.value;
        const totalCells = this.model.rows * this.model.cols;
        for (let i = 1; i <= totalCells; i++) {
            if (i % value == 0) {
                this.$(".grid-col[data-number=" + i + "]").addClass([this._getColors()[color], "filled"]);
            }
        }
    }

    private _showAnswerForRows() {
        this._clearColors();
        const value = this.model.validationData.values;
        for (const val of value) {
            this._forEachCell(
                {
                    col: 0,
                    row: val - 1
                },
                {
                    col: this.model.cols,
                    row: val - 1
                }, this._fillColor.bind(this, this._getColors()[0])
            );
        }
    }

    private _showAnswerForCells() {
        this._clearColors();
        const value = this.model.validationData.values;
        const color = this.model.colors;
        for (const val of value) {
            this.$(".grid-col[data-number=" + val + "]").addClass([this._getColors()[0], "filled"]);
        }
    }

    private _showAnswerForCustom() {
        if (this.model.showAnswerFn) {
            window.BIL.CustomJS[this.model.showAnswerFn](this, this.model);
        }
    }

    private _fillColor(color: string, row: number, col: number) {
        this._getElementFromCell({
            col,
            row
        }).addClass([color, "filled"]);
    }

    private _disable() {
        this.$(".shader").addClass("disabled");
        if (this._showHorizontalSlider()) {
            this.$(".horizontal-slider").slider("disable");
        }
        if (this._showVerticalSlider()) {
            this.$(".vertical-slider").slider("disable");
        }
    }

    private _enable() {
        this.$(".shader").removeClass("disabled");
        if (this._showHorizontalSlider()) {
            this.$(".horizontal-slider").slider("enable");
        }
        if (this._showVerticalSlider()) {
            this.$(".vertical-slider").slider("enable");
        }
    }

    private _hideButtons() {
        this.$(".color-buttons").addClass("hide");
    }

    private _validateGridSize(evt: JQueryEventObject) {
        if (this._isColCountValid() && this._isRowCountValid()) {
            this.model.cols = this._getColCount();
            this.model.rows = this._getRowCount();
            this._renderGrid();
            this._hideError();
        } else {
            this._showError();
        }
    }

    private _getColCount(): number {
        return parseInt(this.$(".col-input").val().toString(), 10);
    }

    private _getRowCount(): number {
        return parseInt(this.$(".row-input").val().toString(), 10);
    }

    private _isColCountValid() {
        const colCount = this._getColCount();
        return colCount >= MIN_VAL && colCount <= MAX_VAL;
    }

    private _isRowCountValid() {
        const rowCount = this._getRowCount();
        return rowCount >= MIN_VAL && rowCount <= MAX_VAL;
    }

    private _showError() {
        this.$(".grid-error-label").addClass("error");
    }

    private _hideError() {
        this.$(".grid-error-label").removeClass("error");
    }

    private _addValidation(validation: string) {
        this._clearValidation();
        this.$(".validation-mark, .shader").addClass(validation);
    }

    private _clearValidation() {
        this.$(".validation-mark, .shader").removeClass("correct incorrect");
    }

    private _triggerChange() {
        this._clearValidation();
        this._enableShowMe();
        if (!this.$(".shader").hasClass("disabled")) {
            this.trigger("changed");
        }
    }

    private _saveData() {
        const data = this._generateDataToBeSaved();
        this.trigger("save-data", data);
    }

    private _generateDataToBeSaved() {
        const type = this.model.saveDataType;
        const SAVE_DATA_TYPES = ShaderPkg.SAVE_DATA_TYPES;
        if (this.model.saveDataType) {
            switch (type) {
                case SAVE_DATA_TYPES.SHADED_ROW_COL:
                    return this._generateSaveDataForShadedRowCol();
                case SAVE_DATA_TYPES.SHADED_COL:
                    return this._generateSaveDataForShadedCol();
                case SAVE_DATA_TYPES.SHADED_ANY:
                    return this._generateSaveDataForShadedAny();
                case SAVE_DATA_TYPES.CUSTOM:
                    return this._generateSaveDataForCustom();
                default:
                    return;
            }
        }
        return null;
    }

    private _generateSaveDataForShadedRowCol() {
        // UNTESTED AND UNUSED
        const filledCols = this._getFilledCols().sort((a, b) => a - b);
        const filledRows = this._getFilledRows().sort((a, b) => a - b);
        return {
            data: {
                cols: filledCols.length,
                filled: {
                    color: this._getFilledColor(),
                    end: {
                        col: filledCols.length - 1,
                        row: filledRows.length - 1
                    },
                    start: {
                        col: 0,
                        row: 0
                    }
                },
                rows: filledRows.length
            },
            type: ShaderPkg.SAVE_DATA_TYPES.SHADED_ROW_COL
        };
    }

    private _generateSaveDataForShadedCol() {
        const filledCol = parseInt(this.$(".grid-col.filled").first().closest("[data-col]").attr("data-col"), 10);
        return {
            data: {
                filledCol
            },
            type: ShaderPkg.SAVE_DATA_TYPES.SHADED_COL
        };
    }

    private _generateSaveDataForShadedAny() {
        const filledData: any[] = [];
        const startCell: Cell = {
            col: 0,
            row: 0
        };
        const endCell: Cell = {
            col: this.model.cols - 1,
            row: this.model.rows - 1
        };
        this._forEachCell(startCell, endCell, (row, col) => {
            if (!filledData[row]) {
                filledData[row] = [];
            }
            filledData[row][col] = {
                color: this._getColorOfCell(row, col)
            };
        });
        return {
            data: {
                filledData
            },
            type: ShaderPkg.SAVE_DATA_TYPES.SHADED_ANY
        };
    }

    private _generateSaveDataForCustom() {
        return {
            data: window.BIL.CustomJS[this.model.saveDataFn](this, this.model),
            type: ShaderPkg.SAVE_DATA_TYPES.CUSTOM
        };
    }

    private _getColorOfCell(row: number, col: number) {
        const $cell = this._getElementFromCell({ row, col });
        if ($cell.hasClass("filled")) {
            const matches = $cell.attr("class").match(COLOR_REGEX);
            return matches[0];
        }
        return "";
    }

    private _getFilledCols(): number[] {
        const $selectedCells = this.$(".grid-col.filled");
        const cols = [] as number[];
        $selectedCells.each((idx: number, elem: HTMLElement) => {
            const $target = $(elem);
            const row = parseInt($target.closest("[data-row]").attr("data-row"), 10);
            const col = parseInt($target.closest("[data-col]").attr("data-col"), 10);
            if (cols.indexOf(col) === -1) {
                cols.push(col);
            }
        });
        return cols;
    }

    private _getFilledRows(): number[] {
        const $selectedCells = this.$(".grid-col.filled");
        const rows = [] as number[];
        $selectedCells.each((idx: number, elem: HTMLElement) => {
            const $target = $(elem);
            const row = parseInt($target.closest("[data-row]").attr("data-row"), 10);
            if (rows.indexOf(row) === -1) {
                rows.push(row);
            }
        });
        return rows;
    }

    private _getFilledColor(): string {
        return this._getColors()[0];
    }

    private _showOnlyShowMeAnswer() {
        this._clearColors();
        const answer = this.model.showMeAns.fillRect;
        for (const data of answer) {
            if (data.rect) {
                const selector = [
                    `.grid-row:nth-child(n+${data.rect[0].row}):nth-child(-n+${data.rect[2].row})`,
                    `.grid-col:nth-child(n+${data.rect[0].col}):nth-child(-n+${data.rect[1].col})`
                ].join(" ");
                this.$(selector).addClass(`filled ${data.color}`);
            }
        }
        this._saveData();
        this.$(".shader-show-me-btn").hide();
        this._disable();
    }

    private _enableShowMe() {
        this.$(".shader-show-me-btn").removeAttr("disabled");
    }
    // tslint:disable-next-line:max-file-line-count
}
