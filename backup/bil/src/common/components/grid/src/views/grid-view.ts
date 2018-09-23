import * as Backbone from "backbone";
/* import * as $ from "jquery"; */
// tslint:disable-next-line:no-import-side-effect
import "jqueryui";
import * as Utilities from "./../../../../helper/utilities";
import "./../../css/grid.styl";
import * as GridModelPkg from "./../models/grid-model";
import CommonUtilities = Utilities;

import { MenuItems } from "./../../../context-menu/src/collections/menu-items";
import * as ContextMenuModelPkg from "./../../../context-menu/src/model/context-menu";
import { ContextMenuView } from "./../../../context-menu/src/views/context-menu";

const touchPunch = require("jquery-ui-touch-punch");

const mainTpl = require("./../../hbs/grid.hbs");

export interface DroppedTimeFormat {
    tile: HTMLElement;
    size: number;
    $newDraggable: JQuery<HTMLElement>;
}

export interface GridViewOptions {
    isAccessible?: boolean;
    getTemplateForTile(tile: GridModelPkg.Tiles): JQuery<HTMLElement>;
}

export interface EventDataMap1 {
    "appended-draggable-drag-start": HTMLElement;
    "appended-draggable-drag-stop": HTMLElement;
    "appended-draggable-deleted": undefined;
    "droppable-selected": HTMLElement;
    "droppable-deselected": undefined;
    "dropped-draggable-deselected": undefined;
    "draggable-dropped": undefined;
    "droppable-grid-selected": undefined;
    "delete-rhs-tile": undefined;
    "drag-started": undefined;
    "drag-stopped": undefined;
}

export interface EventDataMap2 {
    "appended-draggable-drag-start": undefined;
    "appended-draggable-drag-stop": undefined;
    "appended-draggable-deleted": undefined;
    "droppable-selected": undefined;
    "droppable-deselected": undefined;
    "dropped-draggable-deselected": undefined;
    "draggable-dropped": undefined;
    "droppable-grid-selected": undefined;
    "delete-rhs-tile": undefined;
    "drag-started": undefined;
    "drag-stopped": undefined;
}

export class Grid extends Backbone.View<GridModelPkg.Grid> {
    public static CLASSES = {
        DRAGGABLE_DROPPED: "grid-draggable-dropped",
        DROPPED: "grid-droppable-dropped",
        INACTIVE: "grid-droppable-inactive",
        INVALID: "grid-droppable-invalid",
        OCCUPIED: "grid-droppable-occupied",
        PREFILLED_RHS: "grid-prefilled-rhs"
    };
    public model: GridModelPkg.Grid;
    public border = 2;
    public padding = 10;
    public gridCellSize = 35;
    public contextMenu: ContextMenuView;

    public droppedTiles = [] as DroppedTimeFormat[];
    public inactiveTiles = [] as number[];
    public recentDroppableTile: DroppedTimeFormat;
    public getTemplateForTile: (tile: GridModelPkg.Tiles) => JQuery<HTMLElement>;
    public _dropped = false;
    public deleted = false;
    public gridDroppableEnabled = false;
    public gridDroppedDragEnabled = false;
    public revertToDraggable = false;
    public selectedDroppedDraggable: JQuery<HTMLElement>;
    private _assessible: boolean;

    constructor(attr: Backbone.ViewOptions<GridModelPkg.Grid>, options: GridViewOptions) {
        super(attr);
        this.getTemplateForTile = options.getTemplateForTile;
        this._assessible = (options.isAccessible === void 0) ? true : options.isAccessible;
        this.render().renderBehaviour();
        this.initContextMenu();
        this.attachKeyboardEvents();
    }

    public render() {
        this.model.setGridLocText();
        this.$el.html(mainTpl(this.model.toJSON()));
        this.renderDroppables();
        if (this.model.noOfGrids > 1) {
            this.$(".grid-holder").addClass("scaleDown");
        }
        const dynamicGridValues = this.getDynamicGridValues();
        this.$(".grid-holder").height((this.model.cols * dynamicGridValues.gridCellSize) +
            ((this.model.cols - 1) * dynamicGridValues.padding))
            .width((this.model.rows * dynamicGridValues.gridCellSize) + ((this.model.rows - 1) * dynamicGridValues.padding));

        this.initializeDroppables();
        this.autoDropDraggables();
        if (this.model.noOfGrids > 1) {
            $(window).resize(() => {
                if (this.$(".grid-holder").hasClass("scaleDown")) {
                    this.handleGridResize();
                }
            });
        }
        return this;
    }

    public initializeDroppables() {
        this.$(".droppables").droppable({
            /* accept: ".draggable", */
            activeClass: "ui-droppable-active",
            drop: this.onDrop.bind(this),
            hoverClass: "ui-droppable-hover",
            tolerance: "intersect"
        });
    }

    public renderDroppables() {
        const countV = this.model.cols;
        const countH = this.model.rows;
        const dynamicGridValues = this.getDynamicGridValues();
        for (let j = 0; j < countV; j++) {
            const top = Math.floor((j % countV)) * ((dynamicGridValues.padding) + dynamicGridValues.gridCellSize);
            for (let i = 0; i < countH; i++) {
                const left = (i % countH) * ((dynamicGridValues.padding) + dynamicGridValues.gridCellSize);
                let droppableLabel: string = this.model.locTextData.droppable;
                droppableLabel = droppableLabel.split("$#row#$").join((j + 1).toString());
                droppableLabel = droppableLabel.split("$#col#$").join((i + 1).toString());
                const $droppableDiv = $("<div class='droppables' " +
                    "style='left: " + left + "px; top: " + top + "px;' " +
                    "data-row='" + j + "' data-col='" + i + "'></div>");
                $droppableDiv.attr({
                    "aria-dropeffect": "none",
                    "aria-label": droppableLabel
                });
                this.$(".grid-holder").append($droppableDiv);
            }
        }
    }

    public renderBehaviour() {
        const state = this.model.state === GridModelPkg.State.Disabled ? "disable" : "enable";

        if (state == "enable") {
            this.$(".droppables:not(.ui-droppable-disabled)").droppable(state);
            this.$(".draggable:not(.ui-draggable-disabled)").draggable(state);
            this.$(".droppables.ui-droppable-disabled").droppable("disable");
            this.$(".draggable.ui-draggable-disabled").draggable("disable");
        } else {
            this.$(".droppables").droppable(state);
            this.$(".draggable").draggable(state);
        }

        // remove tabindex attribute for disabled elements(else mouse click shows focus)
        this.$(".ui-draggable-disabled").removeAttr("aria-grabbed aria-label tabindex");
        this.$(".ui-droppable-disabled").removeAttr("aria-label aria-dropeffect");
        return this;
    }

    public initContextMenu() {
        if (this.model.state === GridModelPkg.State.Enabled) {
            // initialise context menu if state enabled
            const contextMenuItems = new MenuItems([
                { label: "Delete", val: ContextMenuModelPkg.ModelType.DELETE },
                { label: "Move", val: ContextMenuModelPkg.ModelType.MOVE }
            ]);
            this.contextMenu = new ContextMenuView({
                collection: contextMenuItems,
                el: "div.players-container"
            });
            this.attachContextMenuListeners();
        }
    }

    public attachContextMenuListeners() {
        this.listenTo(this.contextMenu, ContextMenuView.EVENTS.MOVE, this.onMove);
        this.listenTo(this.contextMenu, ContextMenuView.EVENTS.DELETE, this.onDelete);
        this.listenTo(this.contextMenu, ContextMenuView.EVENTS.ESC, this.onESc);
    }

    public onMove(): void {
        // code for moving tile
        this.recentDroppableTile = this.handleDroppedDragStart(this.selectedDroppedDraggable[0]);
        const eleGridDroppable = this.getValidGridDroppable();
        this.enableTabIndex(eleGridDroppable);
        this.gridDroppedDragEnabled = true;
        this.gridDroppableEnabled = false;
        // Utilities.logger.info(eleGridDroppable);
        eleGridDroppable.eq(0).focus();
        // disable tabindex for draggables dropped
        const eleGridDraggable = this.getValidDroppedDraggable();
        this.disableTabIndex(eleGridDraggable);
    }

    public onDelete(): void {
        this.recentDroppableTile = this.handleDroppedDragStart(this.selectedDroppedDraggable[0]);
        this._dropped = false;
        this.deleted = true;
        this.handleDroppedDragStop(this.selectedDroppedDraggable[0], this.selectedDroppedDraggable);
        this.selectedDroppedDraggable = null;
        // deselect dropped draggables
        // disable tabindex for dropped draggables
        const eleGridDraggable = this.getValidDroppedDraggable();
        this.disableTabIndex(eleGridDraggable);
        this.trigger("dropped-draggable-deselected", this.model.gridIndex);
    }

    public onESc(): void {
        this.selectedDroppedDraggable.focus();
        this.selectedDroppedDraggable = null;
    }

    public attachKeyboardEvents() {
        if (this._assessible) {
            this.$el.on("keydown", this.onFocusGrid.bind(this));
            this.$(".droppables").on("keydown", this.onFocusGridDroppable.bind(this));
        }
    }

    public fillAutoDropDraggables(fillData: any) {
        let sizeCount = 0;
        const countH = this.model.rows;
        const prefilled = true;
        for (const tile of fillData) {
            if (tile.xPos !== void 0 && tile.yPos !== void 0) {
                sizeCount = tile.xPos + (tile.yPos * countH);
                const $elem = this.getTemplateForTile(tile.type);
                this.fillGrid(this.$(".droppables").eq(sizeCount)[0], $elem, prefilled, null, tile.disabled);
                this.resetDroppables();
                this._dropped = false;
            } else {
                const $elem = this.getTemplateForTile(tile.type);
                const size = GridModelPkg.Grid.getTileSize(tile.type);
                this.fillGrid(this.$(".droppables").eq(sizeCount)[0], $elem, prefilled, null, tile.disabled);
                this.resetDroppables();
                this._dropped = false;
                sizeCount += size;
            }
        }
    }

    public autoDropDraggables(correctAnswers?: any) {
        if (correctAnswers) {
            this.fillAutoDropDraggables(correctAnswers);
        } else if (this.model.savedState && this.model.savedState.droppedTiles) {
            this.fillAutoDropDraggables(this.model.savedState.droppedTiles);
        }
    }

    public resetDroppables() {
        const cssClasses = Grid.CLASSES;
        const clsToRemove = cssClasses.INACTIVE + " " +
            cssClasses.INVALID + " " +
            cssClasses.DROPPED + " " +
            cssClasses.OCCUPIED;
        this.$(".droppables").removeClass(clsToRemove);
        for (const currDroppedTile of this.droppedTiles) {
            $(currDroppedTile.tile).addClass(cssClasses.INACTIVE + " " + cssClasses.DROPPED);
        }
        for (const currInactiveTile of this.inactiveTiles) {
            this.$(".droppables").eq(currInactiveTile).addClass(cssClasses.INACTIVE);
        }
    }

    public setDroppablesOccupiedByDraggable(draggable: HTMLElement) {
        const size = this.getDraggableSizeFromElem(draggable);
        const $droppables = this.$(".droppables");
        const indexes = [];
        const countH = this.model.rows;

        switch (size) {
            case 2:
                for (const currInactiveTile of this.inactiveTiles) {
                    indexes.push(currInactiveTile - 1);
                }
                break;
            case 3:
                for (const currInactiveTile of this.inactiveTiles) {
                    indexes.push(currInactiveTile - countH);
                }
                break;
            case 4:
                for (const currInactiveTile of this.inactiveTiles) {
                    indexes.push(currInactiveTile - 1);
                    indexes.push(currInactiveTile - countH);
                    indexes.push(currInactiveTile - countH - 1);
                }
        }

        // Utilities.logger.info("Occupied:", indexes);
        for (const currIndex of indexes) {
            $droppables.eq(currIndex).addClass(Grid.CLASSES.OCCUPIED)
                .attr("aria-dropeffect", "none");
        }
    }

    public getDraggableSizeFromElem(elem: HTMLElement | JQuery<HTMLElement>) {
        return parseInt($(elem).data().size, 10);
    }

    public getDropIndexesAsPerSize(targetIndex: number, draggableElem: JQuery<HTMLElement> | HTMLElement | number) {
        let targetSize;
        targetSize = (typeof draggableElem !== "number") ? this.getDraggableSizeFromElem(draggableElem) : draggableElem;
        const targetIndexes: number[] = [];
        const countH = this.model.rows;

        targetIndexes.push(targetIndex);
        switch (targetSize) {
            case 2:
                targetIndexes.push(targetIndex + 1);
                break;
            case 3:
                targetIndexes.push(targetIndex + countH);
                break;
            case 4:
                targetIndexes.push(targetIndex + 1);
                targetIndexes.push(targetIndex + countH);
                targetIndexes.push(targetIndex + countH + 1);
        }
        return targetIndexes;
    }

    public setDroppablesInvalidByDraggable(draggable: HTMLElement) {
        const cssClasses = Grid.CLASSES;
        const size = this.getDraggableSizeFromElem(draggable);
        const $droppables = this.$(".droppables");
        const countV = this.model.cols;
        const countH = this.model.rows;

        switch (size) {
            case 2:
                for (let k = 0; k < countV; k++) {
                    $droppables.eq(k * countH - 1).addClass(cssClasses.INVALID)
                        .attr("aria-dropeffect", "none");
                }
                break;
            case 3:
                for (let k = 0; k < countH; k++) {
                    $droppables.eq((countV * countH) - k - 1).addClass(cssClasses.INVALID)
                        .attr("aria-dropeffect", "none");
                }
                break;
            case 4:
                for (let k = 0; k < countV; k++) {
                    $droppables.eq(k * countH - 1).addClass(cssClasses.INVALID)
                        .attr("aria-dropeffect", "none");
                }
                for (let k = 0; k < countH; k++) {
                    $droppables.eq((countV * countH) - k - 1).addClass(cssClasses.INVALID)
                        .attr("aria-dropeffect", "none");
                }
        }
    }

    public enableDisable(isDisable = false) {
        const str = (isDisable) ? "disable" : "enable";
        this.model.state = (isDisable) ? GridModelPkg.State.Disabled : GridModelPkg.State.Enabled;
        this.$(".droppables").droppable(str);
        this.$(".draggable").draggable(str);
    }

    /**
     * To bind valid events on communicator.
     * @param event valid string event name.
     * @param callback valid callback function with appropriate data.
     * @param context optional, any context to bind callback on.
     */
    // tslint:disable-next-line:max-line-length
    public attachListener<E extends keyof EventDataMap1>(event: E, callback: (data1: EventDataMap1[E], data2?: EventDataMap2[E]) => any, context?: any) {
        if (context !== void 0 && context !== null && typeof context === "object") {
            callback = callback.bind(context);
        }
        return this.on(event, callback);
    }

    public appendDraggable(draggableElem: HTMLElement | JQuery<HTMLElement>, droppableElem: HTMLElement, size: number) {
        const $clone = $(draggableElem).clone();
        const tileType = parseInt($(draggableElem).attr("data-tile-type"), 10);
        let draggableTileLabel = this.model.locTextData.droppedDraggable;
        const row = parseInt($(droppableElem).attr("data-row"), 10) + 1;
        const col = parseInt($(droppableElem).attr("data-col"), 10) + 1;

        this.resetClone($clone);
        draggableTileLabel = this.updateDraggableTileLabel(draggableTileLabel, tileType, row, col);
        // $clone.attr("tabindex", "-1");
        $clone.attr({
            "aria-grabbed": "false",
            "aria-label": draggableTileLabel,
            "tabindex": "-1"
        });
        if (this._assessible) {
            $clone.on("keydown", this.onFocusDroppedDraggable.bind(this));
        }
        $(droppableElem).append($clone);
        this.makeCloneDraggable($clone);
        if ($(draggableElem).hasClass(Grid.CLASSES.DRAGGABLE_DROPPED)) {
            $(draggableElem).remove();
        }
        return $clone;
    }

    public makeCloneDraggable($clone: JQuery<HTMLElement>) {
        $clone.draggable({
            containment: this.$el.closest(".custom_widget_container"),
            revert: (($cloned: JQuery<HTMLElement>, helper: false | JQuery<HTMLElement>) => {
                let toRevert = !this._dropped;
                if (!this._dropped) {
                    toRevert = false;
                    const gridArray = document.getElementsByClassName("grid_container");
                    // tslint:disable-next-line:prefer-for-of
                    for (let i = 0; i < gridArray.length; i++) {
                        const revert = Utilities.Overlap.overlaps($cloned[0], gridArray[i] as HTMLElement);
                        toRevert = toRevert || revert;
                    }
                    this.deleted = !toRevert;
                    // Utilities.logger.info("check 1st", toRevert);
                }
                return toRevert;
            }).bind(this, $clone),
            start: (eve: any, ui: any) => {
                if (this.model.hasRHS) {
                    this.trigger("drag-started", { eve, type: this.model.type });
                }
                this.recentDroppableTile = this.handleDroppedDragStart(eve.target as HTMLElement);
            },
            stop: (($cloned: JQuery<HTMLElement>, eve: JQuery.Event) => {
                this.handleDroppedDragStop(eve.target as HTMLElement, $cloned);
            }).bind(this, $clone)
        });
    }

    public updateDraggableTileLabel(draggableTileLabel: string, tileType: number, row: number, col: number) {
        return draggableTileLabel
            .split("$#tile#$").join(this.model.locTextData["tile" + tileType])
            .split("$#row#$").join(row.toString())
            .split("$#col#$").join(col.toString());
    }

    public resetClone($clone: JQuery<HTMLElement>) {
        $clone.css({
            left: "",
            position: "",
            top: ""
        });
        $clone.addClass(Grid.CLASSES.DRAGGABLE_DROPPED).removeClass("ui-draggable-dragging");
    }

    public handleDroppedDragStop(target: HTMLElement, $cloned: JQuery<HTMLElement>) {
        if (!this._dropped && !this.deleted) {
            const $closestDroppable = $(target).closest(".droppables");
            const targetIndexes = this.getDropIndexesAsPerSize($closestDroppable.index(), this.recentDroppableTile.size);
            this.droppedTiles.push(this.recentDroppableTile);
            for (const currTarIndex of targetIndexes) {
                this.inactiveTiles.push(currTarIndex);
            }
        }
        if (this.deleted) {
            // $cloned.remove();
            Utilities.CSS3Animations.animate($cloned, "fade-out").then(() => {
                $cloned.remove();
            });
            // Utilities.logger.info("Deleted");
            this.deleted = false;
            this.trigger("appended-draggable-deleted", target);
            this.trigger("delete-rhs-tile", target);
        }
        // this.onDragStop(eve, ui); Event for top view...
        this.trigger("appended-draggable-drag-stop", target);
        this.$(".droppables").removeClass("grid-droppable-top");
        this.gridDroppedDragEnabled = false;
    }

    public handleDroppedDragStart(target: HTMLElement) {
        let index = -1;
        let size2 = -1;
        const $closestDroppable = $(target).closest(".droppables");
        this.deleted = false;
        for (let k = 0; k < this.droppedTiles.length; k++) {
            if (this.droppedTiles[k].tile === $closestDroppable[0]) {
                index = k;
                size2 = this.droppedTiles[k].size;
            }
        }
        this.recentDroppableTile = this.droppedTiles[index];
        this.droppedTiles.splice(index, 1);
        const targetIndexes = this.getDropIndexesAsPerSize($closestDroppable.index(), size2);
        for (const currTarIndex of targetIndexes) {
            this.inactiveTiles.splice(this.inactiveTiles.indexOf(currTarIndex), 1);
        }
        // this.onDragStart(eve, ui); Event for top view...
        this.trigger("appended-draggable-drag-start", target);
        // Utilities.logger.info("clone-drag-started");
        $closestDroppable.addClass("grid-droppable-top");
        return this.recentDroppableTile;
    }

    // Disable other draggables until this one stops.
    public disableDraggable(target: HTMLElement) {
        this.$(".draggable").not(target as HTMLElement).draggable("disable");
    }

    // Enable other draggables.
    public enableDraggable(target: HTMLElement) {
        this.$(".draggable:not([data-disabled])").not(target).draggable("enable");
    }

    public getValidDroppedDraggable() {
        const eleGridDraggable = this.$("." + Grid.CLASSES.DRAGGABLE_DROPPED);
        return eleGridDraggable;
    }

    public getValidGridDroppable() {
        const eleGridDroppable = this.$(".droppables:not(." +
            Grid.CLASSES.INACTIVE +
            "):not(." + Grid.CLASSES.INVALID +
            "):not(." + Grid.CLASSES.OCCUPIED +
            "):not(." + Grid.CLASSES.DROPPED +
            "):not(." + Grid.CLASSES.DRAGGABLE_DROPPED +
            ")");
        return eleGridDroppable;
    }

    public enableTabIndex(ele: JQuery<HTMLElement>) {
        this.$(".droppables").attr("tabindex", "-1");
        ele.attr("tabindex", "0");
    }

    public disableTabIndex(ele: JQuery<HTMLElement>) {
        ele.attr("tabindex", "-1");
    }

    public fillSelectedDroppable(droppableTarget: HTMLElement, selectedDraggable: JQuery<HTMLElement>) {
        this.fillGrid(droppableTarget, selectedDraggable);
    }

    public deselectDroppable() {
        this.gridDroppableEnabled = false;
        this.gridDroppedDragEnabled = false;
        this.disableTabIndex(this.$(".droppables"));
    }

    public startDropSelection() {
        this.trigger("droppable-grid-selected");
        const eleGridDroppable = this.getValidGridDroppable();
        this.gridDroppableEnabled = true;
        this.enableTabIndex(eleGridDroppable);
        this.$el.attr("tabindex", "-1");
        // focus on first droppable
        eleGridDroppable.eq(0).focus();
    }

    public fillRHSGrid(data: any) {
        console.info("fill RHS grid");
        const droppedID = data.draggable.attr("dropped-id");
        const draggable = this.$(`.draggable[dropped-id='${droppedID}']`);
        if (droppedID !== data.droppedID) {
            draggable.attr("dropped-id", data.droppedID);
        }
        if (draggable.length == 0 && (!data.draggable.attr("data-prefilled") && this.model.state == GridModelPkg.State.Disabled)) {
            this.resetDroppables();
            this.setDroppablesInvalidByDraggable(data.draggable);
            this.setDroppablesOccupiedByDraggable(data.draggable);
            const droppables = this.$(".droppables:not(." + Grid.CLASSES.INACTIVE +
                "):not(." + Grid.CLASSES.INVALID +
                "):not(." + Grid.CLASSES.OCCUPIED +
                ")")
                .height(data.draggable.height() /* + (PADDING) + BORDER */)
                .width(data.draggable.width() /* + PADDING + BORDER */);
            if (droppables.length > 0) {
                this.fillGrid(droppables[0], data.draggable, false, data.droppedID);
            }
        }
    }

    public deleteRHSTile(target: any) {
        const droppedID = $(target).attr("dropped-id");
        const $draggable = this.$(`.draggable[dropped-id='${droppedID}']`);
        this.recentDroppableTile = this.handleDroppedDragStart($draggable.get()[0]);
        this.deleted = true;
        this.handleDroppedDragStop($draggable.get()[0], $draggable);
        this.trigger("appended-draggable-drag-stop", $draggable.get()[0]);
    }

    private isEndElement(eve: JQuery.Event): boolean {
        const eleGridDraggable = this.getValidDroppedDraggable();
        return (eve.shiftKey && (eve.target as HTMLElement === eleGridDraggable[0])) ||
            (!eve.shiftKey && (eve.target as HTMLElement === eleGridDraggable.last()[0]));
    }

    private onFocusDroppedDraggable(eve: JQuery.Event) {
        const keycode = eve.which;
        const eleGridDraggable = this.getValidDroppedDraggable();
        switch (keycode) {
            case 9:
                // on shift tab from first dropped draggable
                // or
                // on tabbing out of from last droppable remove algebra tiles from tabbing sequence
                if (this.isEndElement(eve)) {
                    // deselect dropped draggables
                    // disable tabindex for dropped draggables
                    this.disableTabIndex(eleGridDraggable);
                }
                break;

            // on escape focus back to grid(update the draggable dropped tab index)
            case 27:
                // deselect dropped draggables
                // disable tabindex for dropped draggables
                this.disableTabIndex(eleGridDraggable);
                this.trigger("dropped-draggable-deselected", this.model.gridIndex);
                break;

            // open context menu
            case 13:
            case 32:
                this.selectedDroppedDraggable = $(eve.target);
                this.contextMenu.appendContextMenu(this.selectedDroppedDraggable);
                this.breakEvent(eve);
        }
    }

    private onFocusGrid(eve: JQuery.Event) {
        const keyCode = eve.which;
        switch (keyCode) {
            case 13:
            case 32:
                this.startDropSelection();
                eve.stopPropagation();
                eve.preventDefault();
        }
    }

    private onFocusGridDroppable(eve: JQuery.Event) {
        const keycode = eve.which;
        const eleGridDroppable = this.getValidGridDroppable();
        if (this.gridDroppableEnabled && !this.gridDroppedDragEnabled) {
            switch (keycode) {
                case 9:
                    // on shift tab from first valid droppable same as esc from any droppable
                    // on tabbing out of from last droppable remove algebra tiles from tabbing sequence
                    if (this.isEndElement(eve)) {
                        // this.revertToDraggable = true;
                        this.deselectDroppable();
                        // reset all drop process
                        this.trigger("droppable-deselected", this.model.gridIndex);
                    }
                    break;

                // on escape revert back the dragged tile i.e. focus back to draggable tile in dispenser
                case 27:
                    this.revertToDraggable = true;
                    this.deselectDroppable();
                    this.trigger("droppable-deselected", this.model.gridIndex);
                    // update boolean to false
                    this.revertToDraggable = false;
                    break;

                case 13:
                case 32:
                    this.deselectDroppable();
                    this.trigger("droppable-selected", eve.target as HTMLElement, this.model.gridIndex);
                    this.breakEvent(eve);
                    break;

                case 37:
                    this.onMoveLeft($(eve.target));
                    this.breakEvent(eve);
                    break;

                case 39:
                    this.onMoveRight($(eve.target));
                    this.breakEvent(eve);
                    break;

                case 38:
                    this.onMoveUp($(eve.target));
                    this.breakEvent(eve);
                    break;

                case 40:
                    this.onMoveDown($(eve.target));
                    this.breakEvent(eve);
            }
        } else if (this.gridDroppedDragEnabled && !this.gridDroppableEnabled) {
            switch (keycode) {
                case 9:
                    //  on shift tab from first valid droppable same as esc from any droppable
                    // on tabbing out of from last droppable remove algebra tiles from tabbing sequence
                    if (this.isEndElement(eve)) {
                        // TODO: call grid drag stop
                        this.handleDroppedDragStop(this.selectedDroppedDraggable[0], this.selectedDroppedDraggable);
                        this.selectedDroppedDraggable = null;
                        // reset all drop process
                        this.deselectDroppable();
                        this.trigger("droppable-deselected", this.model.gridIndex);
                    }
                    break;

                // on escape revert back to the dropped draggable tile i.e. focus back to dropped draggable
                case 27:
                    this.deselectDroppable();
                    // disable tabindex for draggables dropped
                    const eleGridDraggable = this.getValidDroppedDraggable();
                    eleGridDraggable.attr("tabindex", "0");
                    this.handleDroppedDragStop(this.selectedDroppedDraggable[0], this.selectedDroppedDraggable);
                    this.selectedDroppedDraggable.focus();
                    this.selectedDroppedDraggable = null;
                    break;

                case 13:
                case 32:
                    this.fillSelectedDroppable(eve.target as HTMLElement, this.selectedDroppedDraggable);
                    this.handleDroppedDragStop(eve.target as HTMLElement, this.selectedDroppedDraggable);
                    this.resetDroppables();
                    // deselect droppables
                    this.deselectDroppable();
                    // this.selectedDroppedDraggable.focus();
                    $(eve.target).find(".draggable").focus();
                    this.selectedDroppedDraggable = null;
                    this.breakEvent(eve);
                    break;

                case 37:
                    this.onMoveLeft($(eve.target));
                    this.breakEvent(eve);
                    break;

                case 39:
                    this.onMoveRight($(eve.target));
                    this.breakEvent(eve);
                    break;

                case 38:
                    this.onMoveUp($(eve.target));
                    this.breakEvent(eve);
                    break;

                case 40:
                    this.onMoveDown($(eve.target));
                    this.breakEvent(eve);
            }
        }
    }

    private breakEvent(eve: JQuery.Event) {
        eve.stopPropagation();
        eve.preventDefault();
    }

    private onMoveDown(gridDroppable: JQuery<HTMLElement>) {
        const currRowPos = gridDroppable.attr("data-row");
        const currColPos = gridDroppable.attr("data-col");
        const eleGridDroppables = this.getValidGridDroppable();
        this.enableTabIndex(eleGridDroppables);
        // let nextColPos = currColPos + 1;
        let nextRowPos: number = parseInt(currRowPos, 10) + 1;
        do {
            const $filteredDroppables = eleGridDroppables.filter("[data-row='" + nextRowPos + "'][data-col='" + currColPos + "']");
            if ($filteredDroppables.length > 0) {
                $filteredDroppables.focus();
                break;
            }
            // nextColPos = nextColPos + 1;
            nextRowPos = nextRowPos + 1;
        } while (nextRowPos < this.model.cols);
    }

    private onMoveUp(gridDroppable: JQuery<HTMLElement>) {
        const currRowPos = gridDroppable.attr("data-row");
        const currColPos = gridDroppable.attr("data-col");
        const eleGridDroppables = this.getValidGridDroppable();
        this.enableTabIndex(eleGridDroppables);
        // let nextColPos = currColPos + 1;
        let nextRowPos: number = parseInt(currRowPos, 10) - 1;
        do {
            const $filteredDroppables = eleGridDroppables.filter("[data-row='" + nextRowPos + "'][data-col='" + currColPos + "']");
            if ($filteredDroppables.length > 0) {
                $filteredDroppables.focus();
                break;
            }
            // nextColPos = nextColPos + 1;
            nextRowPos = nextRowPos - 1;
        } while (nextRowPos >= 0 && nextRowPos < this.model.cols);
    }

    private onMoveRight(gridDroppable: JQuery<HTMLElement>) {
        const currRowPos = gridDroppable.attr("data-row");
        const currColPos = gridDroppable.attr("data-col");
        const eleGridDroppables = this.getValidGridDroppable();
        this.enableTabIndex(eleGridDroppables);
        let nextColPos: number = parseInt(currColPos, 10) + 1;
        // let nextRowPos: number = parseInt(currRowPos, 10) + 1;
        do {
            const $filteredDroppables = eleGridDroppables.filter("[data-row='" + currRowPos + "'][data-col='" + nextColPos + "']");
            if ($filteredDroppables.length > 0) {
                $filteredDroppables.focus();
                break;
            }
            nextColPos = nextColPos + 1;
            // nextRowPos = nextRowPos + 1;
        } while (nextColPos < this.model.rows);
    }

    private onMoveLeft(gridDroppable: JQuery<HTMLElement>) {
        const currRowPos = gridDroppable.attr("data-row");
        const currColPos = gridDroppable.attr("data-col");
        const eleGridDroppables = this.getValidGridDroppable();
        this.enableTabIndex(eleGridDroppables);
        let nextColPos: number = parseInt(currColPos, 10) - 1;
        // let nextRowPos: number = parseInt(currRowPos, 10) + 1;
        do {
            const $filteredDroppables = eleGridDroppables.filter("[data-row='" + currRowPos + "'][data-col='" + nextColPos + "']");
            if ($filteredDroppables.length > 0) {
                $filteredDroppables.focus();
                break;
            }
            nextColPos = nextColPos - 1;
            // nextRowPos = nextRowPos + 1;
        } while (nextColPos >= 0 && nextColPos < this.model.rows);
    }

    private onDrop(eve: JQuery.Event, ui: JQueryUI.DroppableEventUIParam) {
        this.fillGrid(eve.target as HTMLElement, ui.draggable);
        this.breakEvent(eve);
    }

    // tslint:disable-next-line:max-line-length
    private fillGrid(droppable: HTMLElement, draggable: JQuery<HTMLElement>, prefilled = false, lhsDropID?: number, disabled: boolean = false) {
        if (!this._dropped && !$(droppable).hasClass(Grid.CLASSES.INACTIVE)
            && !$(droppable).hasClass(Grid.CLASSES.INVALID)
            && !$(droppable).hasClass(Grid.CLASSES.OCCUPIED)) {
            const targetIndex = $(droppable).index();
            const size = this.getDraggableSizeFromElem(draggable);
            const targetIndexes = this.getDropIndexesAsPerSize(targetIndex, draggable);
            const $newDraggable = this.appendDraggable(draggable, droppable, size);
            const droppedID = targetIndex;
            for (const tarIndex of targetIndexes) {
                this.inactiveTiles.push(tarIndex);
            }

            if (prefilled && this.model.isRHS) {
                this.markPrefilledRHSDroppables(targetIndexes);
            } else if (this.model.isRHS) {
                $newDraggable.attr("dropped-id", lhsDropID);
            } else {
                $newDraggable.attr("dropped-id", droppedID);
            }

            if (this.model.hasRHS && prefilled) {
                $newDraggable.attr("data-prefilled", "true");
            }

            if (disabled || (this.model.isRHS && this.model.state == GridModelPkg.State.Disabled)) {
                $newDraggable.draggable("disable");
                $newDraggable.attr("data-disabled", "true");
                for (const index of targetIndexes) {
                    this.$(".droppables").eq(index).droppable("disable");
                    this.$(".droppables").eq(index).attr("data-disabled", "true");
                }
            }

            this.droppedTiles.push({ tile: droppable, size, $newDraggable });
            this.trigger("draggable-dropped", {
                draggable,
                droppable,
                droppedID,
                size,
                type: this.model.type
            });
            if (this.model.hasRHS) {
                this.trigger("drag-stopped", {
                    draggable,
                    droppable,
                    droppedID,
                    size,
                    type: this.model.type
                });
            }
        } else {
            // Utilities.logger.info("^ No drop");
        }
    }

    private markPrefilledRHSDroppables(targetIndexes: number[]) {
        for (const index of targetIndexes) {
            this.$(".droppables").eq(index).addClass(Grid.CLASSES.PREFILLED_RHS);
        }
    }

    private getDynamicGridValues() {
        const $customContainer = this.$el.closest("custom_widget_container");
        if (this.model.noOfGrids > 1 && $(window).width() <= 1660) {
            return { padding: 5, gridCellSize: 20 };
        }
        return { padding: 10, gridCellSize: 35 };
    }

    private handleGridResize() {
        const dynamicGridValues = this.getDynamicGridValues();
        this.$(".grid-holder").height((this.model.cols * dynamicGridValues.gridCellSize) +
            ((this.model.cols - 1) * dynamicGridValues.padding))
            .width((this.model.rows * dynamicGridValues.gridCellSize) + ((this.model.rows - 1) * dynamicGridValues.padding));

        const countV = this.model.cols;
        const countH = this.model.rows;
        const $droppablesArray = this.$(".grid-holder").find(".droppables");
        for (let j = 0; j < countV; j++) {
            const top = Math.floor((j % countV)) * ((dynamicGridValues.padding) + dynamicGridValues.gridCellSize);
            for (let i = 0; i < countH; i++) {
                const left = (i % countH) * ((dynamicGridValues.padding) + dynamicGridValues.gridCellSize);
                const $droppable = this.$(`.droppables[data-col='${i}'][data-row='${j}']`);
                $droppable.css({
                    left,
                    top
                });
            }
        }
    }

}
