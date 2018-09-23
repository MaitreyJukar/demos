import * as Backbone from "backbone";
import * as Handlebars from "handlebars";
// tslint:disable-next-line:no-import-side-effect
import "jqueryui";
// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jquery-ui-touch-punch";
import * as _ from "underscore";
import "../../css/dnd-equal.styl";
import * as DndEqualPkg from "../models/dnd-equal";

const dndEqualTemplate: (attr?: any) => string = require("./../../tpl/dnd-equal.hbs");
const droppableTemplate: (attr?: any) => string = require("./../../tpl/droppable.hbs");

const DROP_ZONE_SIZE = 160;

const MAX_DROPPABLE_LIMIT = 25;

const ROW_LIMIT = 5;

export class DndEqual extends Backbone.View<DndEqualPkg.DndEqual> {
    public _draggableSelected: JQuery<HTMLElement> = null;

    private tileSelected = false;

    constructor(attr?: Backbone.ViewOptions<DndEqualPkg.DndEqual>) {
        super(attr);
        this.render();
    }

    public events(): Backbone.EventsHash {
        return {
            "click #clear-all": this.clearDropslots.bind(this),
            "click .add-dropslot:not(.disabled)": this.addDropSlot.bind(this),
            "click .dnd-tool-container:not(.disabled) .close": this.deleteDropslot.bind(this),
            "click .draggables .draggable:not(.ui-draggable-disabled)": this.toggleSelection.bind(this),
            "click .dropslot": this.addTileToDroppable.bind(this),
            "click .type-drop-zones .dropslot .drop-zone": this.addTileToDropZone.bind(this),
            "keydown .add-dropslot, .draggable, .droppable": this.handleKeyDown.bind(this)
        };
    }

    public render(): DndEqual {
        this._addPolyfills();
        this.registerPartial();
        this.$el.html(dndEqualTemplate(this.getTemplateOptions()));
        this.adjustWorkZoneSize();
        this.createDraggables();
        this.createDroppable();
        this.renderPrefilled();
        return this;
    }

    public validate(): boolean {
        const flag = this._validateDND();
        const validationClass = flag ? "correct" : "incorrect";
        this._addValidation(validationClass);
        if (flag && this.model.saveData) {
            const answer = this.$el.find(".dropslot").length;
            this.trigger("save-data", { answer });
        }
        return flag;
    }

    public enable() {
        this.$(".dnd-tool-container").removeClass("disabled");
        this.enableDragging();
        this.enableButtons();
    }

    public disable() {
        this.$(".dnd-tool-container").addClass("disabled");
        this.disableDragging();
        this.disableButtons();
    }

    public showAnswer() {
        this._showValidAnswer();
    }

    private _addPolyfills() {
        if (!document.elementsFromPoint) {
            document.elementsFromPoint = elementsFromPoint;
        }

        function elementsFromPoint(x: number, y: number) {
            const parents = [];
            let parent: any = void 0;
            do {
                if (parent !== document.elementFromPoint(x, y)) {
                    parent = document.elementFromPoint(x, y);
                    parents.push(parent);
                    parent.style.pointerEvents = "none";
                } else {
                    parent = false;
                }
            } while (parent);
            parents.forEach((currParent: any) => currParent.style.pointerEvents = "all");
            return parents;
        }
    }

    private registerPartial() {
        Handlebars.registerPartial("droppable", droppableTemplate);
    }

    private getTemplateOptions() {
        return {
            dropZones: this.getDropZones(),
            dropslots: this.model.dropslots,
            tooltype: this.model.toolType
        };
    }

    private getDropZones() {
        return this.hasDropZones() ? MAX_DROPPABLE_LIMIT : false;
    }

    private adjustWorkZoneSize() {
        this.$(".work-zone-container").width(this.model.columns * DROP_ZONE_SIZE);
    }

    private renderPrefilled() {
        if (this.model.prefilled !== void 0) {
            const counters = this.model.prefilled.counters;
            const $droppables = this.$el.find(".droppable");
            for (let i = 0; i < $droppables.length; i++) {
                for (let j = 1; j <= counters; j++) {
                    const draggablesCount = $droppables.eq(i).find(".draggable").length;
                    if (draggablesCount < MAX_DROPPABLE_LIMIT) {
                        const $clone = this.$(".draggables .draggable").clone().addClass("cloned-item prefilled");
                        this.appendDraggableToDroppable($clone, $droppables.eq(i));
                        this.makeCloneDraggable($clone);
                    }
                }
            }
            this.triggerChangeEvent();
            this.checkDraggableCount();
            if (this.model.prefilled.disabled) {
                this.disablePrefilledDraggables();
            }
        }
    }

    private addDroppable(): JQuery<HTMLElement> {
        const dropslot = $(droppableTemplate({
            dropZones: this.getDropZones()
        }).trim());
        dropslot.insertBefore(this.$(".add-dropslot"));
        this.createDroppable(dropslot);
        return dropslot;
    }

    private createDraggables() {
        this.$el.find(".draggable").draggable({
            cursor: "move",
            helper: "clone",
            start: this.onDragStart.bind(this),
            stop: this.onDragStop.bind(this)
        });
    }

    private checkDraggableCount() {
        const droppedDraggables = this.$(".work-zone .draggable").length;
        if (droppedDraggables >= this.model.maxDrags) {
            this.tileSelected = false;
            this.updateTileSelection();
            this.$(".draggables .draggable:not(.prefilled)").draggable({
                disabled: true
            });
            this.disablePrefilledDraggables();
            this.$(".draggables").addClass("disabled");
        } else {
            this.$(".draggables .draggable:not(.prefilled)").draggable({
                disabled: false
            });
            this.enablePrefilledDraggables();
            this.$(".draggables").removeClass("disabled");
        }
    }

    private createDroppable($droppable?: JQuery<HTMLElement>) {
        const $droppableElem = this.getDroppableElem();
        $droppableElem.droppable({
            accept: ".draggable",
            activeClass: "ui-droppable-active",
            drop: this.onDrop.bind(this),
            greedy: true,
            hoverClass: "ui-droppable-hover",
            tolerance: "intersect"
        });
        if (!this.model.isStatic()) {
            const $workzoneContainer = this.$(".work-zone").addClass("allow-remove");
        }
        this.showHideDropslotModifiers();
    }

    private getDroppableElem($droppable?: JQuery<HTMLElement>) {
        if (this.hasDropZones()) {
            return $droppable ? $droppable.add($droppable.find(".drop-zone")) : this.$(".droppable .drop-zone, .droppable");
        } else {
            return $droppable ? $droppable : this.$(".droppable");
        }
    }

    private deleteDropslot(evt: JQueryEventObject) {
        $(evt.target).closest(".dropslot.droppable").remove();
        this.showHideDropslotModifiers();
        this.triggerChangeEvent();
        this.checkDraggableCount();
    }

    private showHideDropslotModifiers() {
        const $droppables = this.$el.find(".droppable");
        // Show/hide add dropslot button
        if (this.model.isStatic() || $droppables.length == this.model.dropslots.max) {
            this.$el.find(".add-dropslot").css("display", "none");
        } else {
            this.$el.find(".add-dropslot").css("display", "");
        }

        // Show/hide delete dropslot buttons
        if (this.model.isStatic() || $droppables.length <= this.model.dropslots.min) {
            this.$(".work-zone").addClass("min-reached");
        } else {
            this.$(".work-zone").removeClass("min-reached");
        }
        this.updateGroupValue();
    }

    private disableAddDropslot(disable = true) {
        if (disable) {
            this.$(".add-dropslot").addClass("disabled");
        } else {
            this.$(".add-dropslot").removeClass("disabled");
        }
    }

    private updateGroupValue() {
        const $droppables = this.$el.find(".droppable");
        const groupText = $droppables.length === 1 ? "Group:" : "Groups:";
        this.$(".groupValue").html($droppables.length.toString());
        this.$(".groups-text").html(groupText);
    }

    private setGroupValue(value: number) {
        this.$(".groupValue").html(value.toString());
    }

    private enableDragging() {
        this.$el.find(".draggable:not(.prefilled)").draggable({
            disabled: false
        });
        this.enablePrefilledDraggables();
        this.$el.find(".draggables").removeClass("disabled");
        this.checkDraggableCount();
    }

    private enablePrefilledDraggables() {
        if (this.model.prefilled && !this.model.prefilled.disabled) {
            this.$el.find(".draggable.prefilled").draggable({
                disabled: false
            });
        }
    }

    private disableDragging() {
        this.$el.find(".draggable").draggable({
            disabled: true
        });
        this.$el.find(".draggables").addClass("disabled");
    }

    private disablePrefilledDraggables() {
        if (this.model.prefilled) {
            this.$el.find(".draggable.prefilled").draggable({
                disabled: true
            });
        }
    }

    private enableButtons() {
        this.$el.find("#clear-all").removeAttr("disabled");
        this.$(".close").removeClass("disabled");
        this.disableAddDropslot(false);
    }

    private disableButtons() {
        this.$el.find("#clear-all").attr("disabled", "disabled");
        this.$(".close").addClass("disabled");
        this.disableAddDropslot(true);
        this.tileSelected = false;
        this.updateTileSelection();
    }

    private clearDropslots() {
        this.$(".dropslot").empty();
        this.triggerChangeEvent();
        this.checkDraggableCount();
    }

    private toggleSelection() {
        this._clearValidation();
        this.tileSelected = !this.tileSelected;
        this.updateTileSelection();
    }

    private updateTileSelection() {
        if (this.tileSelected) {
            this.$(".draggables .draggable").addClass("tile-selected");
            this.$(".dnd-tool-container").addClass("selection-mode");
        } else {
            this.$(".draggables .draggable").removeClass("tile-selected");
            this.$(".dnd-tool-container").removeClass("selection-mode");
        }
    }

    private addTileToDroppable(evt: JQueryEventObject) {
        if (this.tileSelected && !$(evt.target).hasClass("close") && !$(evt.target).closest(".drop-zone").length) {
            const $droppable = $(evt.currentTarget);
            const draggablesCount = $droppable.find(".draggable").length;
            if (draggablesCount < MAX_DROPPABLE_LIMIT) {
                const $clone = this.$(".draggables .draggable").clone().addClass("cloned-item");
                this.appendDraggableToDroppable($clone, $droppable);
                this.makeCloneDraggable($clone);
                this.triggerChangeEvent();
                this.checkDraggableCount();
            }
        }
    }

    private addTileToDropZone(evt: JQueryEventObject) {
        if (this.tileSelected) {
            const $droppable = $(evt.currentTarget);
            const $dropParent = $droppable.closest(".droppable");
            const draggablesCount = $dropParent.find(".draggable").length;
            if (draggablesCount < MAX_DROPPABLE_LIMIT) {
                const $clone = this.$(".draggables .draggable").clone().addClass("cloned-item");
                if (!$(".draggable", $droppable).length) {
                    this.appendDraggableToDroppable($clone, $droppable);
                } else {
                    this.appendDraggableToDroppable($clone, $dropParent);
                }
                this.makeCloneDraggable($clone);
                this.triggerChangeEvent();
                this.checkDraggableCount();
            }
        }
    }

    private addDropSlot() {
        this.addDroppable();
        this.triggerChangeEvent();
    }

    private onDragStart(eve: JQuery.Event, ui: any) {
        this._clearValidation();
        this.$(".dnd-tool-container").addClass("dragging");
        const draggable = ui.helper;
        draggable.data.isDropped = false;
    }

    private onDragStop(eve: JQuery.Event, ui: any) {
        this.$(".dnd-tool-container").removeClass("dragging");
        const draggable = ui.helper;
        if ($(draggable).hasClass("cloned-item") && !draggable.data.isDropped) {
            $(draggable).remove();
            this.triggerChangeEvent();
            this.checkDraggableCount();
        } else if ($(draggable).hasClass("cloned-item") && draggable.data.isDropped) {
            draggable.css("left", "auto");
            draggable.css("top", "auto");
        }
    }

    private onDrop(eve: JQuery.Event, ui: JQueryUI.DroppableEventUIParam) {
        const draggable = ui.helper as any;
        if (this.isValidDrop(eve, draggable)) {
            const droppableEle = eve.target as HTMLElement;
            const draggableEle = ui.draggable.clone();
            const draggablesCount = $(droppableEle).closest(".droppable").find(".draggable").length;
            if ((draggablesCount + 1) > MAX_DROPPABLE_LIMIT) {
                return;
            }
            this.triggerChangeEvent();
            draggable.data.isDropped = true;
            if (ui.draggable.hasClass("cloned-item")) {
                this.appendDraggableToDroppable(ui.draggable, droppableEle);
                return;
            } else if (draggableEle.hasClass("cloned-item")) {
                return;
            }
            draggableEle.addClass("cloned-item");
            this.appendDraggableToDroppable(draggableEle[0], droppableEle);
            this.makeCloneDraggable(draggableEle);
            this.checkDraggableCount();
        } else {
            draggable.data.isDropped = true;
        }
    }

    private isValidDrop(eve: JQuery.Event, draggable: any) {
        if (this.hasDropZones()) {
            if ($(eve.target).hasClass("drop-zone")) {
                return !$(".draggable", eve.target).length;
            } else if ($(eve.target).hasClass("droppable")) {
                const isValid = !draggable.data.isDropped;
                if (isValid) {
                    eve.target = this.getNearestDropZone(draggable[0]);
                }
                return isValid;
            }
        }
        return true;
    }

    private getNearestDropZone(draggable: HTMLElement): HTMLElement {
        const rect = draggable.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        let $dropZone = $(document.elementsFromPoint(x, y)).filter(".drop-zone");
        if (!$dropZone.length) {
            $dropZone = $(document.elementsFromPoint(rect.left, rect.top)).filter(".drop-zone");
        }
        return $dropZone.length && !$dropZone.find(".draggable").length ? $dropZone[0] : draggable;
    }

    private hasDropZones(): boolean {
        return this.model.toolType === DndEqualPkg.TOOL_TYPE.DROP_ZONES;
    }

    private makeCloneDraggable($clone: JQuery<HTMLElement>) {
        $clone.draggable({
            start: this.onDragStart.bind(this),
            stop: this.onDragStop.bind(this)
        });
    }

    private _validateDND(): boolean {
        const type = this.model.validationType;
        const VALIDATION_TYPES = DndEqualPkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.BASIC:
                return this._validateBasic();
            case VALIDATION_TYPES.ROW_COL:
                return this._validateRowCol();
            default:
                return true;
        }
    }

    private _validateBasic(): boolean {
        const answer = this.model.validationData.value;
        let isValid = true;
        const $dropslots = this.$el.find(".dropslot");
        const totalDropslots = $dropslots.length;
        if ((totalDropslots == 0) ||
            (answer % totalDropslots !== 0) ||
            (this.model.validationData.slots.indexOf(totalDropslots) === -1)) {
            return false;
        } else {
            const eachSlotCount = answer / totalDropslots;
            for (let i = 0; i < $dropslots.length; i++) {
                const value = $dropslots.eq(i).find(".draggable").length;
                if (value !== eachSlotCount) {
                    isValid = false;
                    return isValid;
                }
            }
        }
        return isValid;
    }

    private _validateRowCol(): boolean {
        if (this.$(".work-zone .draggable").length === this.model.validationData.value) {
            let isValid = true;
            const $dropslots = this.$(".dropslot");
            for (const dropslot of $dropslots) {
                const $dropzones = $(".drop-zone", dropslot);
                const $firstDrop = $(".drop-zone .draggable", dropslot).first().parent();
                $dropzones.each((idx: number, dropzone: HTMLElement) => {
                    const isFilled = !!$(".draggable", dropzone).length;
                    isValid = isValid && (isFilled === this._shouldBeFilled(idx, $firstDrop));
                    return isValid ? void (0) : false;
                });
            }
            return isValid;
        }
        return false;
    }

    private _shouldBeFilled(idx: number, $first?: JQuery<HTMLElement>): boolean {
        const totalCols = ROW_LIMIT;
        const totalRows = Math.ceil(MAX_DROPPABLE_LIMIT / ROW_LIMIT);

        const firstIdx = $first ? $first.index() - 1 : 0;

        const firstRow = Math.floor(firstIdx / totalCols);
        const firstCol = firstIdx % totalRows;

        const rows = this.model.validationData.rows + firstRow;
        const cols = this.model.validationData.cols + firstCol;
        const rowNo = Math.floor(idx / totalCols);
        const colNo = idx % totalRows;
        return rowNo >= firstRow && rowNo < rows && colNo >= firstCol && colNo < cols;
    }

    private _showValidAnswer() {
        this._clearValidation();
        const type = this.model.validationType;
        const VALIDATION_TYPES = DndEqualPkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.BASIC:
                this._showBasicAnswer();
                break;
            case VALIDATION_TYPES.ROW_COL:
                this._showRowColAnswer();
                break;
            default:
        }
    }

    private _showBasicAnswer() {
        this.$(".dropslot").empty();
        this._removeAllSlots();

        const $workzoneContainer = this.$(".work-zone");
        $workzoneContainer.empty();

        const answer = this.model.validationData.answer;
        const value = this.model.validationData.value / answer;
        const prefilledCount = this.model.prefilled ? this.model.prefilled.counters : 0;

        for (let i = 0; i < answer; i++) {
            const $dropslot = $(droppableTemplate({
                dropZones: this.getDropZones()
            }).trim());
            for (let j = 0; j < value; j++) {
                const $clonedItem = this.$el.find(".draggables .draggable").clone();
                if (j < prefilledCount) {
                    $clonedItem.addClass("prefilled");
                }
                this.appendDraggableToDroppable($clonedItem, $dropslot);
            }
            $workzoneContainer.append($dropslot);
        }
        this.setGroupValue(answer);
        if (this.model.saveData) {
            this.trigger("save-data", { answer });
        }
    }

    private _showRowColAnswer() {
        const $dropslots = this.$(".dropslot");
        for (const dropslot of $dropslots) {
            const $dropzones = $(".drop-zone", dropslot);
            $dropzones.empty();
            $dropzones.each((idx: number, dropzone: HTMLElement) => {
                if (this._shouldBeFilled(idx)) {
                    const $clonedItem = this.$el.find(".draggables .draggable").clone();
                    this.appendDraggableToDroppable($clonedItem, dropzone);
                }
            });
        }
    }

    private _addValidation(validation: string) {
        this._clearValidation();
        this.$(".dnd-tool-container").addClass(validation);
    }

    private _clearValidation() {
        this.$(".dnd-tool-container").removeClass("correct incorrect");
    }

    private _removeAllSlots() {
        this.$(".dropslot.droppable").remove();
    }

    private triggerChangeEvent() {
        this._clearValidation();
        this.trigger("changed");
    }

    private appendDraggableToDroppable(draggable: HTMLElement | JQuery<HTMLElement>, droppable: HTMLElement | JQuery<HTMLElement>) {
        const $droppable = $(droppable);
        if (this.hasDropZones()) {
            if ($droppable.hasClass("drop-zone")) {
                $droppable.append(draggable);
            } else {
                const $emptyDropZones = $(".drop-zone:empty", $droppable);
                if ($emptyDropZones.length) {
                    $emptyDropZones.eq(0).append(draggable);
                }
            }
        } else {
            $droppable.append(draggable);
        }
    }

    private handleKeyDown(evt: JQueryEventObject) {
        if (evt.which == 13 || evt.which == 32) {
            const $tartget = $(evt.target);
            if ($tartget.hasClass("draggable") && this._draggableSelected == null) {
                const target = evt.target;
                this._draggableSelected = $(target);
                $(".droppable")[0].focus();
            } else if ($tartget.hasClass("droppable") && this._draggableSelected != null) {
                const droppableEle = evt.target as HTMLElement;
                const draggableEle = this._draggableSelected.clone();
                const draggablesCount = $(droppableEle).find(".draggable").length;
                if ((draggablesCount + 1) > MAX_DROPPABLE_LIMIT) {
                    return;
                }
                this.triggerChangeEvent();
                if (this._draggableSelected.hasClass("cloned-item")) {
                    this.appendDraggableToDroppable(this._draggableSelected, droppableEle);
                    return;
                } else if (draggableEle.hasClass("cloned-item")) {
                    return;
                }
                draggableEle.addClass("cloned-item");
                this.appendDraggableToDroppable(draggableEle[0], droppableEle);
                this.makeCloneDraggable(draggableEle);
                this._draggableSelected = null;
            } else if ($tartget.hasClass("add-dropslot")) {
                this.addDropSlot();
                this._draggableSelected = null;
            }
        }
    }
}
