import * as Backbone from "backbone";
/* import * as $ from "jquery"; */
import * as _ from "underscore";
import * as Utilities from "./../../../../helper/utilities";
import CommonUtilities = Utilities;
import "./../../css/algebra-tiles.styl";
import * as AlgebraTilesModelPkg from "./../models/algebra-tiles-model";
import * as GridModelPkg from "./../models/grid-model";
import * as GridViewPkg from "./../views/grid-view";

export interface ExtWindow extends Window {
    BIL: any;
}
declare const window: ExtWindow;

export interface BrowserDetect {
    name: string;
    os: string;
    version: string;
}

export interface GridView {
    view: GridViewPkg.Grid;
    type: string;
}

const { detect } = require("detect-browser");
const browser: BrowserDetect = detect();
const mainTpl = require("./../../hbs/algebra-tiles-handler.hbs");
const gridViewTpl = require("./../../hbs/grid-view.hbs");

export class AlgebraTiles extends Backbone.View<AlgebraTilesModelPkg.AlgebraTiles> {
    public model: AlgebraTilesModelPkg.AlgebraTiles;
    public gridViews: GridView[] = [];
    public rhsGridViews: GridView[] = [];
    public selectedDraggable: JQuery<HTMLElement>;
    public selectedAccDraggable: HTMLElement;
    private _assessible: boolean;
    private dragStart: any;
    private dragStop: any;

    constructor(attr: Backbone.ViewOptions<AlgebraTilesModelPkg.AlgebraTiles>) {
        super(attr);
        this._assessible = false; // Change this to true once component is ready for accessibility again..
        this.attachModelEvents();
        this.$el.addClass("algebra-tiles-container");
        this.render()
            .renderBehaviour();
        this.attachKeyboardEvents();
        this.initGridViews().then(this.initDraggables.bind(this));
        this.initAccessibility();
    }

    /**
     * Returns jQuery template (div) from given tile type.
     * @purpose For grid view as it does not know what kind of draggable to be appended when loaded from saved state.
     * @param tile Tile type.
     */
    public static templateFromTile(tile: GridModelPkg.Tiles) {
        let draggableCls: string;
        switch (tile) {
            case 0:
            case 4:
                draggableCls = " draggable1";
                break;
            case 2:
            case 6:
                draggableCls = "XHorizontal draggable2";
                break;
            case 1:
            case 5:
                draggableCls = "XVertical draggable3";
                break;
            case 3:
            case 7:
                draggableCls = "XSquare draggable4";

        }
        const isPlus = GridModelPkg.Grid.isPlusTile(tile);
        const className = (isPlus) ? "plus" : "minus";
        // tslint:disable-next-line:max-line-length
        const $Tpl = $("<div class=\"draggable tile\"><span class=\"bil-icon-" + className + " tile-icon\"></span></div>");
        $Tpl.addClass(className + draggableCls);
        return $Tpl;
    }

    public disable() {
        this.enableDisable(false);
    }

    public enable() {
        this.enableDisable(true);
    }

    public validate(): boolean {
        const flag = this._validateAlgTiles();
        const validationClass = flag ? "correct" : "incorrect";
        this._addValidation(validationClass);
        return flag;
    }

    public showAnswer() {
        this._showValidAnswer();
        this.$(".algebra_tiles_wrapper").addClass("answer-shown");
    }

    public clearValidation() {
        // Functions to be called on clicking try again
    }

    public finish() {
        // Functions to be called on clicking next or continue
    }

    public attachModelEvents() {
        this.listenTo(this.model, "change:behaviour", this.onBehaviourChange);
    }

    public attachKeyboardEvents() {
        if (this._assessible) {
            this.$(".algebra_tiles_container").on("keydown", this.selectAlgebraTile.bind(this));
            this.$(".algebra_tiles_container .tileContainer .tile").on("keydown", this.onFocusAlgeTile.bind(this));
            this.$(".algebra_tiles_container .tileContainer .tile").eq(7).on("keydown", this.onFocusLastAlgeTile.bind(this));
            this.$(".algebra_tiles_container .tileContainer .tile").eq(0).on("keydown", this.onFocusFirstAlgeTile.bind(this));
            this.$(".canvasArea").on("keydown", this.selectDroppedDraggableTile.bind(this));
        }
    }

    public renderBehaviour() {
        if (this.model.behaviour === AlgebraTilesModelPkg.Behaviour.Static) {
            this.$(".custom_widget_container").addClass("grid-static");
        } else {
            this.$(".custom_widget_container").removeClass("grid-static");
        }
        return this;
    }

    public onBehaviourChange() {
        this.renderBehaviour();
    }

    public initAccessibility() {
        // add aria-label attribute value from json
        this.$(".algebra_tiles_container").attr("aria-label", this.model.locTextData.algeTilesContainer);
        const $algeTile: JQuery<HTMLElement> = this.$(".algebra_tiles_container .tileContainer .tile");
        for (let i = 0; i < $algeTile.length; i++) {
            const tileType = parseInt($algeTile.eq(i).attr("data-tile-type"), 10);
            let draggableTileLabel = this.model.locTextData.draggableTile;
            draggableTileLabel = draggableTileLabel.split("$#tile#$").join(this.model.locTextData["tile" + tileType]);
            $algeTile.eq(i).attr("aria-label", draggableTileLabel);
        }
        this.$(".canvasArea").attr("aria-label", this.model.locTextData.gridCanvasArea);
        // add aria-grabbed and aria-dropeffect for drag and drop
        this.$(".draggable").attr("aria-grabbed", "false");
    }

    /**
     * Returns jQuery template (div) from given tile type.
     * @purpose For grid view as it does not know what kind of draggable to be appended when loaded from saved state.
     * @param tile Tile type.
     */
    public templateFromTile(tile: GridModelPkg.Tiles) {
        let draggableCls: string;
        switch (tile) {
            case 0:
            case 4:
                draggableCls = " draggable1";
                break;
            case 2:
            case 6:
                draggableCls = "XHorizontal draggable2";
                break;
            case 1:
            case 5:
                draggableCls = "XVertical draggable3";
                break;
            case 3:
            case 7:
                draggableCls = "XSquare draggable4";

        }
        const isPlus = GridModelPkg.Grid.isPlusTile(tile);
        const className = (isPlus) ? "plus" : "minus";
        const $Tpl = $("<div class=\"draggable tile\" data-tile-type=" +
            tile + " data-size=" + GridModelPkg.Grid.getDataTileSize(tile) + "><span class=\"bil-icon-" +
            className + " tile-icon\"></span></div>");
        $Tpl.addClass(className + draggableCls);
        return $Tpl;
    }

    public initGridViews() {
        return this.model.getJSON().then(this.onDataParse.bind(this), (err) => {
            CommonUtilities.Utilities.logger.warn(err);
        });
    }

    public initDraggables(data: AlgebraTilesModelPkg.ParsedData) {
        this.$(".draggable:not(.grid-draggable-dropped)").draggable({
            containment: this.$el,
            helper: "clone",
            start: this.onDragStart.bind(this),
            stop: this.onDragStop.bind(this)
        });
        return data;
    }

    public resetDroppables() {
        this.gridViews.forEach((gridView) => {
            gridView.view.resetDroppables();
        });
    }

    public setDroppablesInvalidByDraggable(draggable: HTMLElement) {
        this.gridViews.forEach((gridView) => {
            gridView.view.setDroppablesInvalidByDraggable(draggable);
        });
    }

    public setDroppablesOccupiedByDraggable(target: HTMLElement) {
        this.gridViews.forEach((gridView) => {
            gridView.view.setDroppablesOccupiedByDraggable(target);
        });
    }

    public setDraggableDisabled(target: HTMLElement) {
        this.getViewsOfType("main").forEach((viewData) => {
            viewData.view.disableDraggable(target);
        });
        if (this.model.isScratchpad) {
            this.getViewsOfType("col").forEach((viewData) => {
                viewData.view.disableDraggable(target);
            });
            this.getViewsOfType("row").forEach((viewData) => {
                viewData.view.disableDraggable(target);
            });
        }
    }

    public setDraggableEnabled(target: HTMLElement) {
        this.getViewsOfType("main").forEach((viewData) => {
            viewData.view.enableDraggable(target);
        });
        if (this.model.isScratchpad) {
            this.getViewsOfType("col").forEach((viewData) => {
                viewData.view.enableDraggable(target);
            });
            this.getViewsOfType("row").forEach((viewData) => {
                viewData.view.enableDraggable(target);
            });
        }
    }

    public isdroppped(dropped: boolean) {
        this.gridViews.forEach((gridView) => {
            gridView.view._dropped = dropped;
        });
    }

    public render() {
        this.$el.html(mainTpl(this.model.toJSON()));
        if (this.model.algeData.questions && this.model.algeData.questions.length > 2) {
            this.$el.find(".custom_widget_container").addClass("scaleDown");
        }
        if (browser) {
            $("body").addClass(browser.name);
        }
        this.model.setAlgeTilesLocText();
        return this;
    }

    /**
     * Enables / Disables based on param.
     * If type is inner, disable/enables main grid, otherwise disable/enables rest grids.
     * @param isEnable To determine whether to disable or enable.
     */
    public enableDisable(isEnable = true) {
        const str = (isEnable) ? "enable" : "disable";
        CommonUtilities.Utilities.logger.info("enableDisable(): ", isEnable);
        for (const [index, gridViewModel] of this.model.gridViewData.entries()) {
            if (this.model.isInner[index]) {
                this.getViewsOfType("main")[index].view.enableDisable(!isEnable);
            } else {
                this.getViewsOfType("main")[index].view.enableDisable(!isEnable);
                this.getViewsOfType("col")[index].view.enableDisable(!isEnable);
                this.getViewsOfType("row")[index].view.enableDisable(!isEnable);
            }
        }
        this.$(".draggable").draggable(str);
        return this;
    }

    public onDragStarted(args: any) {
        const index = $(args.eve.target).closest(".grid").attr("data-gridID");
        this.dragStart = { type: args.type, index: parseInt(index, 10) };
        this._triggerChangeEvent();
    }

    public onDragStopped(args: any) {
        this.dragStop = args.type;
        const index = this.dragStart && this.dragStart.index;
        if (index !== void 0 && this.dragStart.type !== this.dragStop) {
            const rhsViews = this.rhsGridViews.filter((view) => view.type == "main");
            rhsViews[index].view.deleteRHSTile(args.draggable);
        }
    }

    public handleDragStart(target: HTMLElement) {
        this.setDraggableDisabled(target);
        this.resetDroppables();
        this.setDroppablesInvalidByDraggable(target);
        this.setDroppablesOccupiedByDraggable(target);
        this.$(".droppables:not(." + GridViewPkg.Grid.CLASSES.INACTIVE +
            "):not(." + GridViewPkg.Grid.CLASSES.INVALID +
            "):not(." + GridViewPkg.Grid.CLASSES.OCCUPIED +
            "):not(.ui-droppable-disabled)")
            .height($(target).height() /* + (PADDING) + BORDER */)
            .width($(target).width() /* + PADDING + BORDER */);

        this.isdroppped(false);

        // update aria-grabbed for selected draggable
        $(target).attr("aria-grabbed", "true");
        if (this.selectedDraggable !== null) {
            this.$(".droppables").attr("aria-dropeffect", "copy");
        } else {
            this.$(".droppables").attr("aria-dropeffect", "move");
        }
        this._triggerChangeEvent();
    }

    public handleDraggableDropped() {
        this.isdroppped(true);
    }

    public handleDragStop(target?: HTMLElement) {
        this.isdroppped(false);
        this.$(".draggable").attr("aria-grabbed", "false");
        this.$(".droppables").css({ height: "", width: "" })
            .attr("aria-dropeffect", "none");
        this.resetDroppables();
        this.setDraggableEnabled(target);
    }

    public startDropSelection(elem: HTMLElement) {
        this.handleDragStart(elem);
        let eleGridDroppable;
        this.getViewsOfType("main").forEach((gridView) => {
            eleGridDroppable = gridView.view.getValidGridDroppable();
            gridView.view.gridDroppableEnabled = true;
            gridView.view.enableTabIndex(eleGridDroppable);
            gridView.view.$el.find(".canvasArea").attr("tabindex", "-1");
            eleGridDroppable.eq(0).focus();
        });
        // focus on first droppable
    }

    public onDroppableGridSelected(): void {
        this.handleDragStart(this.selectedAccDraggable);
    }

    public selectDroppableGrid(elem: HTMLElement) {
        this.selectedAccDraggable = elem;
        const allowedGrids = this.getAllowedGridViews();
        for (const grid of allowedGrids) {
            this.enableGridTabIndex(grid);
        }
        allowedGrids[0].$el.focus();
    }

    public deselectFromAnyAlgeTile() {
        // change tiles tabindex to -1
        this.$(".tileContainer").find(".tile").attr("tabindex", "-1");
    }

    private enableGridTabIndex(grid: GridViewPkg.Grid): void {
        grid.$el.attr("tabindex", "0");
    }

    private getAllowedGridViews(): GridViewPkg.Grid[] {
        const allowedGrids: GridViewPkg.Grid[] = [];
        for (const [index, gridData] of this.model.gridViewData.entries()) {
            if (this.model.isScratchpad[index]) {
                allowedGrids.push(this.getViewsOfType("main")[index].view);
                allowedGrids.push(this.getViewsOfType("col")[index].view);
                allowedGrids.push(this.getViewsOfType("row")[index].view);
            } else {
                allowedGrids.push(this.getViewsOfType("main")[index].view);
            }
        }
        return allowedGrids;
    }

    // deselectFromFirstAlgeTile
    private onFocusFirstAlgeTile(eve: JQuery.Event) {
        //  on shift tab to outer container remove algebra tiles from tabbing sequence
        if (eve.which === 9 && eve.shiftKey) {
            this.deselectFromAnyAlgeTile();
        }
    }

    // deselectFromLastAlgeTile
    private onFocusLastAlgeTile(eve: JQuery.Event) {
        // on tabbing out of algebra tiles from last tile remove algebra tiles from tabbing sequence
        if (eve.which === 9 && !eve.shiftKey) {
            this.deselectFromAnyAlgeTile();
        }
    }

    private selectAlgebraTile(eve: JQuery.Event) {
        if (eve.which === 13 || eve.which === 32) {
            // change tiles tabindex to 0
            this.$(".tileContainer").find(".tile").attr("tabindex", "0");
            // focus on first tile
            this.$(".algebra_tiles_container .tileContainer .tile").eq(0).focus();
        }
    }

    private onFocusAlgeTile(eve: JQuery.Event) {
        const keycode = eve.which;
        switch (keycode) {
            // on escape focus back to outer container
            case 27:
                this.deselectFromAnyAlgeTile();
                this.$(".algebra_tiles_container").focus();
                break;

            case 13:
            case 32:
                this.selectedDraggable = $(eve.target);
                // this.selectedDraggable.attr("aria-grabbed", "true");
                this.deselectFromAnyAlgeTile();
                this.selectDroppableGrid(eve.target as HTMLElement);
                // this.startDropSelection(eve.target as HTMLElement);
                eve.stopPropagation();
                eve.preventDefault();
        }
    }

    private selectDroppedDraggableTile(eve: JQuery.Event) {
        if (eve.which === 13 || eve.which === 32) {
            this.getViewsOfType("main").forEach((viewData) => {
                const eleGridDraggable = viewData.view.getValidDroppedDraggable();
                viewData.view.enableTabIndex(eleGridDraggable);
                // focus on first dropped tile in grid
                eleGridDraggable.eq(0).focus();
            });
        }
    }

    private onDragStart(eve: JQuery.Event, ui: JQueryUI.DroppableEventUIParam) {
        const target = eve.target;
        this.selectedDraggable = target[0];
        this.handleDragStart(target as HTMLElement);
    }

    private onDragStop(eve: JQuery.Event, ui: JQueryUI.DroppableEventUIParam) {
        this.selectedDraggable = null;
        this.handleDragStop(eve.target as HTMLElement);
    }

    private onDroppableSelected(droppable: HTMLElement, gridIndex: number) {
        this.getViewsOfType("main")[gridIndex].view.fillSelectedDroppable(droppable, this.selectedDraggable);
        // this.selectedDraggable.attr("aria-grabbed", "false");
        this.selectedDraggable = null;
        this.handleDragStop(droppable);
        this.$("grid_container_" + gridIndex).find(".canvasArea").attr("tabindex", "0");
        this.deselectFromAnyAlgeTile();
        // focus on algebra tiles container
        this.$(".algebra_tiles_container").focus();
    }

    private onDroppableDeselected(gridIndex: number) {
        const mainView = this.getViewsOfType("main")[gridIndex].view;
        mainView.$el.find(".canvasArea").attr("tabindex", "0");

        if (mainView.revertToDraggable) {
            // change tiles tabindex to 0
            this.$(".tileContainer").find(".tile").attr("tabindex", "0");
            // focus on reverted dragged tile
            this.$(this.selectedDraggable).focus();
        }
        // this.selectedDraggable.attr("aria-grabbed", "false");
        this.selectedDraggable = null;
        this.handleDragStop();
    }

    private onDroppedDraggableDeselected(gridIndex: number) {
        const mainView = this.getViewsOfType("main")[gridIndex].view;
        const $canvasArea = mainView.$el.find(".canvasArea");
        $canvasArea.attr("tabindex", "0");
        $canvasArea.focus();
    }

    private getViewsOfType(type: string): GridView[] {
        return this.gridViews.filter((view) => view.type == type);
    }

    private onDataParse(data: AlgebraTilesModelPkg.ParsedData) {
        const $gridsContainer = this.$(".grids-container");
        for (const [index, gridView] of this.model.gridViewData.entries()) {
            const hasRHS = (gridView.rhs !== void 0) ? true : false;
            $gridsContainer.append(gridViewTpl({ index, hasRHS }));
            const $gridContainer = $gridsContainer.find("#grid_container_" + index);
            const $rowContainer = $gridContainer.find(".colHeader");
            const rowSS = {
                droppedTiles: gridView.rowData
            };
            const rowGridView = this.createGridView(data[index].row, index, $rowContainer, rowSS, false, hasRHS, "row");

            const colSS = {
                droppedTiles: gridView.colData
            };
            const $colContainer = $gridContainer.find(".rowHeader");
            const colGridView = this.createGridView(data[index].col, index, $colContainer, colSS, false, hasRHS, "col");

            const mainSS = {
                droppedTiles: gridView.canvasData
            };
            const $mainContainer = $gridContainer.find(".canvasArea");
            const mainGridView = this.createGridView(data[index].canvas, index, $mainContainer, mainSS, false, hasRHS, "main");

            /* this.listenTo(this.mainGridView, "appended-draggable-drag-start", this.onDragStart);
            this.listenTo(this.mainGridView, "appended-draggable-drag-stop", this.onDragStop); */

            this.gridViews.push({
                type: "main",
                view: mainGridView
            });
            this.gridViews.push({
                type: "col",
                view: colGridView
            });
            this.gridViews.push({
                type: "row",
                view: rowGridView
            });

            if (hasRHS) {
                const $rhsGridContainer = $gridsContainer.find("#rhs-grid_container_" + index);
                const $rhsRowContainer = $rhsGridContainer.find(".colHeader");
                const state = (data[index].rhs.state) ? data[index].rhs.state : GridModelPkg.State.Disabled;
                const rhsRowSS = {
                    droppedTiles: gridView.rhs.rowData
                };
                const rhsRowGridView =
                    this.createGridView(data[index].rhs.row, index, $rhsRowContainer, rhsRowSS, hasRHS, false, "row", state);

                const $rhsColContainer = $rhsGridContainer.find(".rowHeader");
                const rhsColSS = {
                    droppedTiles: gridView.rhs.colData
                };
                const rhsColGridView =
                    this.createGridView(data[index].rhs.col, index, $rhsColContainer, rhsColSS, hasRHS, false, "col", state);

                const $rhsMainContainer = $rhsGridContainer.find(".canvasArea");
                const rhsMainSS = {
                    droppedTiles: gridView.rhs.canvasData
                };
                // tslint:disable-next-line:max-line-length
                const rhsMainGridView = this.createGridView(data[index].rhs.canvas, index, $rhsMainContainer, rhsMainSS, hasRHS, false, "main", state);
                this.rhsGridViews.push({
                    type: "main",
                    view: rhsMainGridView
                });
                if (state == "enabled") {
                    this.gridViews.push({
                        type: "main",
                        view: rhsMainGridView
                    });
                    rhsMainGridView.attachListener("appended-draggable-drag-start", this.handleDragStart, this);
                    rhsMainGridView.attachListener("appended-draggable-drag-stop", this.handleDragStop, this);
                    rhsMainGridView.attachListener("draggable-dropped", this.handleDraggableDropped, this);
                    // rhsMainGridView.attachListener("droppable-selected", this.onDroppableSelected, this);
                    // rhsMainGridView.attachListener("droppable-deselected", this.onDroppableDeselected, this);
                    // rhsMainGridView.attachListener("dropped-draggable-deselected", this.onDroppedDraggableDeselected, this);
                    // rhsMainGridView.attachListener("droppable-grid-selected", this.onDroppableGridSelected, this);
                }
                mainGridView.attachListener("draggable-dropped", rhsMainGridView.fillRHSGrid.bind(rhsMainGridView), this);
                mainGridView.attachListener("delete-rhs-tile", rhsMainGridView.deleteRHSTile.bind(rhsMainGridView), this);

            }

        }
        return data;
    }

    private displaySavedState(type: string, index: number) {
        switch (type) {
            case "main":
                return this.model.showSolution[index];
            case "row":
                return this.model.fillEquation2[index] || this.model.showSolution[index];
            case "col":
                return this.model.fillEquation1[index] || this.model.showSolution[index];
        }
    }

    // tslint:disable-next-line:max-line-length
    private createGridView(data: AlgebraTilesModelPkg.TableStruct, index: number, $container: JQuery<HTMLElement>, gridSS: any, isRHS?: boolean, hasRHS: boolean = false, type?: string, rhsState?: string): GridViewPkg.Grid {
        let state: any;
        if (isRHS) {
            state = (rhsState == "enabled") ? GridModelPkg.State.Enabled : GridModelPkg.State.Disabled;
        } else if (this.model.isInner[index] && type == "main") {
            state = GridModelPkg.State.Enabled;
        } else {
            state = (this.model.isScratchpad[index]) ?
                GridModelPkg.State.Enabled : GridModelPkg.State.Disabled;
        }
        const gridModel = new GridModelPkg.Grid({
            cols: data.cols,
            currentLanguage: this.model.currentLanguage,
            gridIndex: index,
            hasRHS,
            isRHS,
            noOfGrids: this.model.noOfGrids,
            rows: data.rows,
            savedState: !this.displaySavedState(type, index) ? {} : gridSS,
            state,
            type
        });
        const view = new GridViewPkg.Grid({
            el: $container, // $gridContainer.find(".colHeader"),
            model: gridModel
        }, {
                getTemplateForTile: this.templateFromTile,
                isAccessible: this._assessible
            });

        if (!isRHS) {
            view.attachListener("appended-draggable-drag-start", this.handleDragStart, this);
            view.attachListener("appended-draggable-drag-stop", this.handleDragStop, this);
            view.attachListener("droppable-selected", this.onDroppableSelected, this);
            view.attachListener("droppable-deselected", this.onDroppableDeselected, this);
            view.attachListener("dropped-draggable-deselected", this.onDroppedDraggableDeselected, this);
            view.attachListener("draggable-dropped", this.handleDraggableDropped, this);
            view.attachListener("droppable-grid-selected", this.onDroppableGridSelected, this);
            view.attachListener("drag-started", this.onDragStarted, this);
            view.attachListener("drag-stopped", this.onDragStopped, this);
        }

        return view;
    }

    private _addValidation(validation: string) {
        this._clearValidation();
        this.$(".algebra_tiles_wrapper").addClass(validation);
    }

    private _clearValidation() {
        this.$(".algebra_tiles_wrapper").removeClass("correct incorrect");
    }

    private _triggerChangeEvent() {
        this._clearValidation();
        this.trigger("changed");
    }

    private _validateAlgTiles(): boolean {
        const type = this.model.validationType;
        const VALIDATION_TYPES = AlgebraTilesModelPkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.BASIC:
                return this._validateBasicAnswer();
            case VALIDATION_TYPES.CUSTOM:
                return this._validateCustom();
            default:
                return true;
        }
    }

    private _fillEnteredAnswerList() {
        const enteredAnswerList: any[] = [];
        const tileData = this.$("#canvasArea-0 .grid-droppable-dropped");
        for (let i = 0; i < tileData.length; i++) {
            const child = this.$("#canvasArea-0 .grid-droppable-dropped .tile");
            const data = {
                type: parseInt(child[i].dataset.tileType, 10),
                xPos: parseInt(tileData[i].dataset.col, 10),
                yPos: parseInt(tileData[i].dataset.row, 10)
            };
            enteredAnswerList.push(data);
        }
        return enteredAnswerList;
    }

    private _validateBasicAnswer(): boolean {
        const enteredAnswerList = this._fillEnteredAnswerList();
        const correctAnswers = this.model.gridAnswerData[0].canvasData;
        if (JSON.stringify(enteredAnswerList) != JSON.stringify(correctAnswers)) {
            return false;
        }
        return true;
    }

    private _validateCustom(): boolean {
        return window.BIL.CustomJS[this.model.validationFn](this, this.model);
    }

    private _showValidAnswer() {
        this._clearValidation();
        const type = this.model.validationType;
        const VALIDATION_TYPES = AlgebraTilesModelPkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.BASIC:
                this._showBasicAnswer();
                break;
            case VALIDATION_TYPES.CUSTOM:
                this._showCustomAnswer();
                break;
            default:
        }
    }

    private _showBasicAnswer() {
        this.gridViews[0].view.autoDropDraggables(this.model.gridAnswerData[0].canvasData);
    }

    private _showCustomAnswer() {
        window.BIL.CustomJS[this.model.showAnswerFn](this, this.model);
    }

}
