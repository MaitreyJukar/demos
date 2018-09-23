import * as Backbone from "backbone";
// tslint:disable-next-line:no-import-side-effect
import "jqueryui";
import * as _ from "underscore";
import "../../css/drag-drop.styl";
import * as DragDropPkg from "../models/drag-drop";

const touchPunch = require("jquery-ui-touch-punch");
const buttonsTemplate: (attr?: any) => string = require("./../../tpl/buttons.hbs");
const dragDropTemplate: (attr?: any) => string = require("./../../tpl/drag-drop.hbs");
const Handlebars = require("handlebars");

export enum blockType {
    ones = 0,
    tens = 1,
    hundreds = 2,
    thousands = 3
}

const TYPES = [0, 1, 2, 3];

export class DragDrop extends Backbone.View<DragDropPkg.DragDrop> {

    public selectedDraggable: JQuery<HTMLElement>;
    private _isGroupMode: boolean;
    private _isUngroupMode: boolean;
    private _selectedBlock: blockType;
    private revUnitNames: string[] = [];
    private _isAccessible: boolean;
    constructor(attr?: Backbone.ViewOptions<DragDropPkg.DragDrop>) {
        super(attr);
        this._isGroupMode = false;
        this._isUngroupMode = false;
        this.registerHelper();
        this.reverseUnitNamesArray();
        this.render();
        this.addClass();
        this.createDraggables();
        this.createDroppable();
        this.createTrashCan();
        this.adjustWidths();
        this.prefillData();
        this.disableInitial();
        this._isAccessible = true;
    }

    public render(): DragDrop {
        this.$el.html(dragDropTemplate(this.getTemplateOptions()));
        this.$(".buttons").html(buttonsTemplate());
        if (this.model.headers !== void 0) {
            this.$(".buttons").addClass("top-align");
            this.$(".draggables").addClass("top-align");
        }
        return this;
    }

    public validate(): boolean {
        const flag = this._validateDND();
        this.setIconPosition(flag);
        if (flag) {
            this.disable();
            this._saveData();
        }
        return flag;
    }

    public disable() {
        this.disableDragging();
        this.disableButtons();
    }

    public enable() {
        this.enableDragging();
        this.enableButtons();
        this.clearValidation();
    }

    public showAnswer(): void {
        this._showCorrectAnswer();
        this._saveData();
    }

    public events(): Backbone.EventsHash {
        return {
            "click #cancel": this.cancelGrouping.bind(this),
            "click #confirm": this.confirmGrouping.bind(this),
            "click #group": this.setGroupMode.bind(this),
            "click #ungroup": this.setUngroupMode.bind(this),
            "click .droppable .draggable.hovered": this.onClick.bind(this),
            "keydown .draggable": this.handleKeyEventForDraggables.bind(this),
            "keydown .droppable": this.handleKeyEventForDraggables.bind(this)
        };
    }

    private prefillData() {
        const prefilledData = this.model.prefilled;
        const $dropZone = $("<div class='drop-zone'></div>");
        if (prefilledData && prefilledData.length) {
            for (const data of prefilledData) {
                this.$el.find(".droppable").append($dropZone.clone());
                let remainingValue = data.value;
                const remainingThousands = Math.floor(remainingValue / 1000);
                remainingValue -= (remainingThousands * 1000);

                const remainingHundreds = Math.floor(remainingValue / 100);
                remainingValue -= (remainingHundreds * 100);

                const remainingTens = Math.floor(remainingValue / 10);
                remainingValue -= (remainingTens * 10);

                const remainingOnes = Math.floor(remainingValue);

                for (let i = 0; i < remainingThousands; i++) {
                    this.appendClone("thousands");
                    this.model.incrementThousands();
                }

                for (let i = 0; i < remainingHundreds; i++) {
                    this.appendClone("hundreds");
                    this.model.incrementHundreds();
                }

                for (let i = 0; i < remainingTens; i++) {
                    this.appendClone("tens");
                    this.model.incrementTens();
                }

                for (let i = 0; i < remainingOnes; i++) {
                    this.appendClone("ones");
                    this.model.incrementOnes();
                }
            }
        } else {
            this.$el.find(".droppable").append($dropZone.clone());
        }
    }

    private appendClone(type: string) {
        const clonedItem = this.$el.find(".draggables ." + type + "-draggable").clone();
        this.$el.find("." + type + "-droppable .drop-zone:last-child").append(clonedItem);
        clonedItem.addClass("cloned-item");
        this.makeCloneDraggable(clonedItem);
    }

    private emptyDropSlots() {
        const droppables = this.$el.find(".droppable .drop-zone");
        for (const droppable of droppables) {
            $(droppable).empty();
        }
        this.model.ones = 0;
        this.model.tens = 0;
        this.model.hundreds = 0;
        this.model.thousands = 0;
        this.$el.find(".droppable .drop-zone:not(:first-child)").remove();
    }

    private clearValidation() {
        this.$el.find(".cross-holder, .tick-holder").addClass("hidden");
        this.$(".droppables").removeClass("correct incorrect");
    }

    private setIconPosition(flag: boolean) {
        this.clearValidation();
        const $droppables = this.$(".droppables");
        const top = ($droppables.height()) / 2; // draggable 150
        const left = $droppables.width() + 15 + 150;   // draggable = 150 + 15 margin
        const icon = flag ? this.$el.find(".tick-holder") : this.$el.find(".cross-holder");
        icon.removeClass("hidden");
        // icon.css("top", top);
        // icon.css("left", left);
        this.showHideConfirmationButtons(false);
        if (flag) {
            $droppables.addClass("correct");
        } else {
            $droppables.addClass("incorrect");
        }
    }

    private reverseUnitNamesArray() {
        const unitNames: string[] = this.model.get("draggableUnitNames");
        this.revUnitNames = unitNames.slice().reverse();
    }

    private disableButtons() {
        this.$el.find("#group, #ungroup").attr("disabled", "disabled");
    }

    private enableButtons() {
        this.$el.find("#group, #ungroup").removeAttr("disabled");
    }

    private addClass() {
        const dropEles = this.$el.find(".droppable-wrapper");
        const classList = ["ones", "tens", "hundreds", "thousands"];
        let j = 0;
        for (let i = dropEles.length - 1; i >= 0; i-- , j++) {
            $(dropEles[i]).addClass(classList[j]);
            $(dropEles[i]).find(".droppable").addClass(classList[j] + "-droppable");
        }
    }

    private adjustWidths() {
        const dropEles = this.$el.find(".droppable-wrapper");
        const remainingBlocks = dropEles.length - 2;
        const usedWidth = (195 + 245) / remainingBlocks; // ones width + tens width + border width
        const perc = 100 / remainingBlocks;
        const newWidth = "calc(" + perc + "% - " + usedWidth + "px)";
        for (let i = dropEles.length - 1 - 2; i >= 0; i--) {
            $(dropEles[i]).width(newWidth);
        }
    }

    private disableInitial() {
        if (this.model.disableInitial) {
            this.$el.find("#group").attr("disabled", "disabled");
            this.$el.find("#ungroup").attr("disabled", "disabled");
            this.disable();
        }
    }

    private registerHelper() {
        Handlebars.registerHelper("invIndex", this.invIndex);
        Handlebars.registerHelper("greaterThan", this.greaterThan);
        Handlebars.registerHelper("isEqual", this.isEqual);
    }

    private greaterThan(v1: number, v2: number, options: any) {
        "use strict";
        if (v1 > v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    }

    private invIndex(index: number, length: number) {
        return length - 1 - index;
    }

    private isEqual(v1: string, v2: string, options: any) {
        if (v1 == v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    }

    private getTemplateOptions() {
        return {
            activityType: this.model.activityType,
            blue: this.model.theme === DragDropPkg.THEMES.BLUE,
            buttonPos: this.model.buttonPos,
            emptyTrashText: "Drop the blocks you want to subtract here.",
            hasTrash: this.hasTrash(),
            headers: this.model.headers,
            isNotDraggable: !this.isDraggable(),
            revUnitNames: this.revUnitNames,
            theme: this.model.theme,
            unitNames: this.model.get("unitNames"),
            unitNamesLen: this.revUnitNames.length
        };
    }

    private hasTrash(): boolean {
        return (this.model.activityType === DragDropPkg.ACTIVITY_TYPE.SUBTRACT
            || this.model.activityType === DragDropPkg.ACTIVITY_TYPE.SUBTRACT_MODEL);
    }

    private isDraggable(): boolean {
        return [
            DragDropPkg.ACTIVITY_TYPE.DRAG_DROP,
            DragDropPkg.ACTIVITY_TYPE.MODEL,
            DragDropPkg.ACTIVITY_TYPE.SUBTRACT,
            DragDropPkg.ACTIVITY_TYPE.SUBTRACT_MODEL
        ].indexOf(this.model.activityType) > -1;
    }

    private createDraggables(): void {
        if (this.isDraggable()) {
            this.$el.find(".draggable").draggable({
                containment: this.$el,
                cursor: "move",
                helper: "clone",
                start: this.onDragStart.bind(this),
                stop: this.onDragStop.bind(this)
            });
        }
    }

    private onDragStart(eve: JQuery.Event, ui: any) {
        const draggable = ui.helper;
        draggable.data.isDropped = false;
    }

    private onDragStop(eve: JQuery.Event, ui: any) {
        const draggable = ui.helper;
        if ($(draggable).hasClass("cloned-item") && !draggable.data.isDropped) {
            $(draggable).remove();
            const type = parseInt(draggable[0].dataset.type, 10);

            switch (type) {
                case blockType.ones:
                    this.model.decrementOnes();
                    break;
                case blockType.tens:
                    this.model.decrementTens();
                    break;
                case blockType.hundreds:
                    this.model.decrementHundreds();
                    break;
                case blockType.thousands:
                    this.model.decrementThousands();
            }
            this.triggerChangeEvent();
        } else if ($(draggable).hasClass("cloned-item") && draggable.data.isDropped) {
            draggable.css({
                left: "auto",
                top: "auto"
            });
        }
    }

    private createDroppable(): void {
        if (this.isDraggable()) {
            this.$el.find(".thousands-droppable").droppable({
                accept: ".thousands-draggable",
                activeClass: "ui-droppable-active",
                drop: this.onDrop.bind(this),
                hoverClass: "ui-droppable-hover",
                tolerance: "intersect"
            });
            this.$el.find(".hundreds-droppable").droppable({
                accept: ".hundreds-draggable",
                activeClass: "ui-droppable-active",
                drop: this.onDrop.bind(this),
                hoverClass: "ui-droppable-hover",
                tolerance: "intersect"

            });
            this.$el.find(".tens-droppable").droppable({
                accept: ".tens-draggable",
                activeClass: "ui-droppable-active",
                drop: this.onDrop.bind(this),
                hoverClass: "ui-droppable-hover",
                tolerance: "intersect"

            });
            this.$el.find(".ones-droppable").droppable({
                accept: ".ones-draggable",
                activeClass: "ui-droppable-active",
                drop: this.onDrop.bind(this),
                hoverClass: "ui-droppable-hover",
                tolerance: "intersect"
            });
        }
    }

    private createTrashCan() {
        if (this.hasTrash()) {
            this.$(".trash-area").droppable({
                accept: ".droppables-container .droppables .droppable .draggable, .trash-area .trashed-droppables .draggable",
                activeClass: "trash-active",
                drop: this.dropInTrash.bind(this),
                hoverClass: "trash-hover",
                tolerance: "intersect"
            });

            this.$(".droppables-container").droppable({
                accept: ".trash-area .trashed-droppables .draggable",
                activeClass: "from-trash-active",
                drop: this.dropFromTrash.bind(this),
                hoverClass: "from-trash-hover",
                tolerance: "intersect"
            });
        }
    }

    private dropInTrash(eve: JQuery.Event, ui: JQueryUI.DroppableEventUIParam) {
        const data = ui.draggable.data as any;
        data.dropped = true;
        if (ui.draggable.is(".droppables-container .droppables .droppable .draggable")) {
            const $draggable = ui.draggable.clone().css({
                left: "",
                top: ""
            });
            const draggableType = $draggable.data("type");
            this.$(`.trash-area [data-trash-type=${draggableType}]`).append($draggable);
            this.makeTrashDraggable($draggable);
        } else {
            const $draggable = ui.draggable.css({
                left: "",
                top: ""
            });
        }
        this.checkTrashEmpty();
        this.triggerChangeEvent();
    }

    private dropFromTrash(eve: JQuery.Event, ui: JQueryUI.DroppableEventUIParam) {
        const draggableEle = ui.draggable.css({
            left: "",
            top: ""
        });
        const type = parseInt(draggableEle[0].dataset.type, 10);
        const droppableEle = this.$(`.droppables-container .droppable-wrapper .droppable[data-type=${type}]`);
        if (this._checkMax(type)) {
            return false;
        }
        this.triggerChangeEvent();
        const draggable = ui.helper as any;
        draggable.data.isDropped = true;
        draggableEle.addClass("cloned-item");
        $(".drop-zone:first-child", droppableEle).append(draggableEle[0]);
        this.makeCloneDraggable(draggableEle);
        this.updateModelValues(type);
        this.checkTrashEmpty();
    }

    private _checkMax(type: number) {
        const count = this.checkExistingBlocks(type);
        if (this.model.max) {
            const max = this.model.max[type];
            if (max === -1) {
                return false;
            }
            return count >= max;
        }
        return count >= this.model.maxBlocks;
    }

    private makeTrashDraggable($draggable: JQuery<HTMLElement>) {
        $draggable.draggable({
            containment: this.$el,
            start: this.onTrashDragStart.bind(this),
            stop: this.onTrashDragStop.bind(this)
        });
    }

    private onTrashDragStart(eve: JQuery.Event, ui: JQueryUI.DroppableEventUIParam) {
        const data = ui.helper.data as any;
        data.dropped = false;
    }

    private onTrashDragStop(eve: JQuery.Event, ui: JQueryUI.DroppableEventUIParam) {
        const data = ui.helper.data as any;
        if (!data.dropped) {
            ui.helper.remove();
        }
        this.checkTrashEmpty();
        this.triggerChangeEvent();
    }

    private isTrashValid() {
        const $trashArea = this.$(".trash-area");
        const thousands = $(".thousands-draggable", $trashArea).length;
        const hundreds = $(".hundreds-draggable", $trashArea).length;
        const tens = $(".tens-draggable", $trashArea).length;
        const ones = $(".ones-draggable", $trashArea).length;
        return ones < 10 && tens < 10 && hundreds < 10 && thousands < 10;
    }

    private getTrashValue() {
        const $trashArea = this.$(".trash-area");
        const thousands = $(".thousands-draggable", $trashArea).length;
        const hundreds = $(".hundreds-draggable", $trashArea).length;
        const tens = $(".tens-draggable", $trashArea).length;
        const ones = $(".ones-draggable", $trashArea).length;
        return thousands * 100 + hundreds * 100 + tens * 10 + ones;
    }

    private checkTrashEmpty() {
        const $trashArea = this.$(".trash-area");
        const isEmpty = !$(".draggable", $trashArea).length;
        if (isEmpty) {
            $trashArea.addClass("empty");
        } else {
            $trashArea.removeClass("empty");
        }
    }

    private updateModelValues(type: number) {
        switch (type) {
            case blockType.ones:
                this.model.incrementOnes();
                break;
            case blockType.tens:
                this.model.incrementTens();
                break;
            case blockType.hundreds:
                this.model.incrementHundreds();
                break;
            case blockType.thousands:
                this.model.incrementThousands();
        }
    }

    private onDropFromKeyEvents(eve: JQuery.Event) {
        if (this._selectedBlock != null) {
            const droppableEle = eve.target as HTMLElement;
            const draggableEle = this.selectedDraggable.clone();
            const type = this._selectedBlock;
            this.triggerChangeEvent();
            if (this._checkMax(type)) {
                return;
            }
            if (draggableEle.hasClass("cloned-item")) {
                return;
            }

            draggableEle.addClass("cloned-item");
            $(".drop-zone:first-child", droppableEle).append(draggableEle[0]);
            this.makeCloneDraggable(draggableEle);

            this.updateModelValues(type);
            this.selectedDraggable = null;
            this._selectedBlock = null;
        }
    }

    private onDrop(eve: JQuery.Event, ui: JQueryUI.DroppableEventUIParam) {

        const droppableEle = eve.target as HTMLElement;
        const draggableEle = ui.draggable.clone();
        const type = parseInt(draggableEle[0].dataset.type, 10);
        this.triggerChangeEvent();
        if (this._checkMax(type)) {
            return;
        }
        const draggable = ui.helper as any;
        draggable.data.isDropped = true;
        if (draggableEle.hasClass("cloned-item")) {
            return;
        }

        draggableEle.addClass("cloned-item");
        $(".drop-zone:first-child", droppableEle).append(draggableEle[0]);
        this.makeCloneDraggable(draggableEle);

        this.updateModelValues(type);

    }

    private makeCloneDraggable($clone: JQuery<HTMLElement>) {
        if (this.isDraggable()) {
            $clone.draggable({
                containment: this.$el,
                start: this.onDragStart.bind(this),
                stop: this.onDragStop.bind(this)
            });
        }
    }

    private _setButtonStates() {
        const $groupBtn = this.$("#group");
        const $ungroupBtn = this.$("#ungroup");
        const $both = this.$("#group, #ungroup");
        $both.removeClass("selected");

        if (this._isGroupMode) {
            $ungroupBtn.attr("disabled", "disabled");
            $groupBtn.removeAttr("disabled").addClass("selected");
        } else if (this._isUngroupMode) {
            $groupBtn.attr("disabled", "disabled");
            $ungroupBtn.removeAttr("disabled").addClass("selected");
        } else {
            $both.removeAttr("disabled");
        }
    }

    private bindDocEvent() {
        $(document).on("click.grouping", this.unsetModes.bind(this));
    }

    private unbindDocEvent() {
        $(document).off("click.grouping");
    }

    private unsetModes(evt: JQueryEventObject) {
        if (!this.keepGroupingEnabled(evt.target)) {
            this.unsetGroupingMode();
            this.unbindDocEvent();
        }
    }

    private keepGroupingEnabled(ele: Element) {
        return $(ele).closest(".hovered, .grouping-btn").length > 0;
    }

    private setGroupMode() {
        this._isUngroupMode = false;
        this._isGroupMode = !this._isGroupMode;
        this.unbindDocEvent();
        if (this._isGroupMode) {
            this.bindDocEvent();
            this.disableDragging();
        } else {
            this.enableDragging();
        }
        this._setButtonStates();
        this.onModeToggled();
    }

    private setUngroupMode() {
        this._isGroupMode = false;
        this._isUngroupMode = !this._isUngroupMode;
        this.unbindDocEvent();
        if (this._isUngroupMode) {
            this.bindDocEvent();
            this.disableDragging();
        } else {
            this.enableDragging();
        }
        this._setButtonStates();
        this.onModeToggled();
    }

    private unsetGroupingMode() {
        this._isGroupMode = false;
        this._isUngroupMode = false;
        this.enableDragging();
        this._setButtonStates();
        this.onModeToggled();
    }

    private addBlock(type: number) {
        let newEle: HTMLElement;
        switch (type) {
            case blockType.ones:
                newEle = this.$el.find(".draggables .ones-draggable").clone()[0];
                this.$(".ones-droppable .drop-zone:first-child").append(newEle);
                this.model.incrementOnes();
                break;
            case blockType.tens:
                newEle = this.$el.find(".draggables .tens-draggable").clone()[0];
                this.$(".tens-droppable .drop-zone:first-child").append(newEle);
                this.model.incrementTens();
                break;
            case blockType.hundreds:
                newEle = this.$el.find(".draggables .hundreds-draggable").clone()[0];
                this.$(".hundreds-droppable .drop-zone:first-child").append(newEle);
                this.model.incrementHundreds();
                break;
            case blockType.thousands:
                newEle = this.$el.find(".draggables .thousands-draggable").clone()[0];
                this.$(".thousands-droppable .drop-zone:first-child").append(newEle);
                this.model.incrementThousands();
        }
        $(newEle).addClass("cloned-item");

        this.makeCloneDraggable($(newEle));
    }

    private removeBlock(type: number) {
        let ele: HTMLElement;
        switch (type) {
            case blockType.ones:
                ele = this.$el.find(".ones-droppable .ones-draggable")[0];
                this.model.decrementOnes();
                break;
            case blockType.tens:
                ele = this.$el.find(".tens-droppable .tens-draggable")[0];
                this.model.decrementTens();
                break;
            case blockType.hundreds:
                ele = this.$el.find(".hundreds-droppable .hundreds-draggable")[0];
                this.model.decrementHundreds();
                break;
            case blockType.thousands:
                ele = this.$el.find(".thousands-droppable .thousands-draggable")[0];
                this.model.decrementThousands();
        }
        $(ele).remove();
    }

    private showHideConfirmationButtons(show: boolean = true) {
        if (show) {
            this.$(".validation-btn").removeClass("hide");
        } else {
            this.$(".validation-btn").addClass("hide");
        }
    }

    private cancelGrouping() {
        this.$(".droppable").removeClass("selected");
        this.showHideConfirmationButtons(false);
    }

    private confirmGrouping() {
        if (this._isGroupMode) {
            this.groupElements();
        } else if (this._isUngroupMode) {
            this.ungroupElements();
        }
    }

    private groupElements() {
        for (let i = 0; i < 10; i++) {
            this.removeBlock(this._selectedBlock);
        }
        const rearrangeType = this._selectedBlock;
        this.addBlock(++this._selectedBlock);
        this._selectedBlock = null;
        this._isGroupMode = false;
        this._setButtonStates();
        this.enableDragging();
        this.$(".droppable").removeClass("selected");
        this.showHideConfirmationButtons(false);
        this.onModeToggled();
        this.simplifyGroups([rearrangeType]);
        this.triggerChangeEvent();
    }

    private ungroupElements() {
        this.removeBlock(this._selectedBlock);
        this._selectedBlock = this._selectedBlock - 1;
        const rearrangeType = this._selectedBlock;
        for (let i = 0; i < 10; i++) {
            this.addBlock(this._selectedBlock);
        }
        this._selectedBlock = null;
        this._isUngroupMode = false;
        this._setButtonStates();
        this.enableDragging();
        this.$(".droppable").removeClass("selected");
        this.showHideConfirmationButtons(false);
        this.onModeToggled();
        this.simplifyGroups([rearrangeType]);
        this.triggerChangeEvent();
    }

    private simplifyGroups(types?: number[]) {
        types = types ? types : TYPES.slice(0, this.model.unitNames.length);
        for (const type of types) {
            const $droppable = this.$(".droppable[data-type=" + type + "]");
            const $draggables = $(".draggable", $droppable);
            $(".drop-zone:first-child", $droppable).append($draggables);
        }
        this.$(".drop-zone:not(:first-child):empty").remove();
    }

    private disableDragging() {
        if (this.isDraggable()) {
            this.$el.find(".draggable").draggable({
                disabled: true
            });
            this.$el.find(".draggables").addClass("disabled");
        }
    }

    private enableDragging() {
        if (this.isDraggable()) {
            this.$el.find(".draggable").draggable({
                disabled: false
            });
            this.$el.find(".draggables").removeClass("disabled");
        }
    }

    private onModeToggled() {
        this.$(".droppable").removeClass("selected");
        if (this._isGroupMode || this._isUngroupMode) {
            this.onModeToggledOn();
        } else {
            this.onModeToggledOff();
        }
    }

    private onModeToggledOn() {
        this.highlightBlocks();
    }

    private checkExistingBlocks(type: number) {
        let currentBlocks: number;
        switch (type) {
            case blockType.ones:
                currentBlocks = this.model.ones;
                break;
            case blockType.tens:
                currentBlocks = this.model.tens;
                break;
            case blockType.hundreds:
                currentBlocks = this.model.hundreds;
                break;
            case blockType.thousands:
                currentBlocks = this.model.thousands;
        }
        return currentBlocks;
    }

    private highlightBlocks() {
        const types = this.model.unitNames.length;
        for (let type = 0; type < types; type++) {
            const $target = this.$(".droppable[data-type=" + type + "]");
            if (this._isGroupMode && this.checkIfGroupPossible(type)) {
                $target.addClass("hover-group-mode");
                $(".draggable", $target).slice(0, 10).addClass("hovered group-hover");
                if (this._isAccessible) {
                    $(".draggable", $target).slice(0, 1).focus();
                }
            } else if (this._isUngroupMode && this.checkIfUngroupPossible(type)) {
                $target.addClass("hover-ungroup-mode");
                $(".draggable", $target).first().addClass("hovered ungroup-hover");
                if (this._isAccessible) {
                    $(".draggable", $target).first().focus();
                }
            }
        }
    }

    private checkIfGroupPossible(type: number): boolean {
        if (type === this.model.unitNames.length - 1) {
            return false;
        }
        const flag = (this.checkExistingBlocks(type) >= 10) && (this.checkExistingBlocks(type + 1) + 1 <= this.model.maxBlocks);
        return flag;
    }

    private checkIfUngroupPossible(type: number): boolean {
        if (type <= 0) {
            return false;
        }
        const flag = (this.checkExistingBlocks(type) >= 1) && (this.checkExistingBlocks(type - 1) + 10 <= this.model.maxBlocks);
        return flag;
    }

    private onModeToggledOff() {
        this.$(".draggable").removeClass("hovered group-hover ungroup-hover");
    }

    private onClick(event: any) {
        if (!this._isGroupMode && !this._isUngroupMode) {
            return;
        }
        const type = parseInt(event.currentTarget.dataset.type, 10);
        if (!this.checkIfGroupPossible(type) && this._isGroupMode) {
            return;
        }
        if (!this.checkIfUngroupPossible(type) && this._isUngroupMode) {
            return;
        }
        switch (type) {
            case blockType.ones:
                if (this._isUngroupMode) {
                    return;
                }
                this._selectedBlock = blockType.ones;
                break;
            case blockType.tens:
                this._selectedBlock = blockType.tens;
                break;
            case blockType.hundreds:
                if (this.model.unitNames.length === blockType.hundreds && this._isGroupMode) {
                    return;
                }
                this._selectedBlock = blockType.hundreds;
                break;
            case blockType.thousands:
                if (this._isGroupMode) {
                    return;
                }
                this._selectedBlock = blockType.thousands;

        }
        if (this._isGroupMode) {
            this.$(".droppable").removeClass("selected group-mode");
            $(event.currentTarget).closest(".droppable").addClass("selected group-mode");
            // this.showHideConfirmationButtons(true);
            this.confirmGrouping();

        } else if (this._isUngroupMode) {
            this.$(".droppable").removeClass("selected ungroup-mode");
            $(event.currentTarget).closest(".droppable").addClass("selected ungroup-mode");
            // this.showHideConfirmationButtons(true);
            this.confirmGrouping();
        }
    }

    private handleKeyEventForDraggables(event: any) {
        if (this._isAccessible) {
            const keycode = event.which;
            switch (keycode) {
                case 13:
                case 32:
                    if (this._isGroupMode || this._isUngroupMode) {
                        $(event.target).click();
                    }
                    if ($(event.target).attr("data-type") != undefined && $(event.target).hasClass("draggable")) {
                        this._selectedBlock = parseInt($(event.target).attr("data-type"), 10) as blockType;
                        this.selectedDraggable = $(event.target);
                        this.getDroppableFromType(this._selectedBlock).focus();
                    }
                    if ($(event.target).hasClass("droppable")) {
                        this.onDropFromKeyEvents(event);
                    }
            }
        }
    }

    private getDroppableFromType(type: blockType) {
        switch (type) {
            case blockType.hundreds:
                return this.$(".hundreds-droppable");
            case blockType.thousands:
                return this.$(".thousands-droppable");
            case blockType.tens:
                return this.$(".tens-droppable");
            case blockType.ones:
                return this.$(".ones-droppable");
        }
    }

    private _validateDND(): boolean {
        const VALIDATION_TYPES = DragDropPkg.VALIDATION_TYPES;
        switch (this.model.validationType) {
            case VALIDATION_TYPES.COMPARE:
                return this._validateCompare();
            case VALIDATION_TYPES.SUBTRACT:
                return this._validateSubtraction();
            default:
                return false;
        }
    }

    private _validateCompare(): boolean {
        return this._validateValue();
    }

    private _validateSubtraction(): boolean {
        return this._validateDropRegion() && this._validateTrashRegion();
    }

    private _validateValue(): boolean {
        return this.model.comparisonValue === this.model.getCurrentValue();
    }

    private _validateDropRegion(): boolean {
        return this.model.numbers[0] - this.model.numbers[1] === this.model.getCurrentValue();
    }

    private _validateTrashRegion(): boolean {
        return (this.model.numbers[1] === this.getTrashValue());
    }
    private _showCorrectAnswer() {
        const VALIDATION_TYPES = DragDropPkg.VALIDATION_TYPES;
        switch (this.model.validationType) {
            case VALIDATION_TYPES.COMPARE:
                this._showCompareAnswer();
                break;
            case VALIDATION_TYPES.SUBTRACT:
                this._showSubtractAnswer();
                break;
            default:
                return;
        }
    }

    private _showCompareAnswer() {
        this.emptyDropSlots();
        const remainingValue = (this.model.comparisonValue - this.model.getCurrentValue()) * this.model.divideFactor;
        if (this.model.specificAnswer) {
            this._fillSpecificAnswer(this.model.specificAnswer);
        } else {
            this._fillDropSlots(remainingValue);
        }
        this.clearValidation();
    }

    private _fillSpecificAnswer(answer: any) {
        for (const type in answer) {
            if (answer[type]) {
                const count = answer[type];
                for (let i = 0; i < count; i++) {
                    const clonedItem = this.$el.find(`.draggables .${type}-draggable`).clone();
                    this.$el.find(`.${type}-droppable .drop-zone:first-child`).append(clonedItem);
                    clonedItem.addClass("cloned-item");
                }
                this.model[type] = count;
            }
        }
    }

    private _fillDropSlots(remainingValue: number) {
        const remainingThousands = Math.floor(remainingValue / 1000);
        const remainingHundreds = Math.floor((remainingValue - (remainingThousands * 1000)) / 100);
        const remainingTens = Math.floor((remainingValue - (remainingThousands * 1000) - (remainingHundreds * 100)) / 10);
        const remainingOnes = Math.floor((remainingValue - (remainingThousands * 1000) - (remainingHundreds * 100) - (remainingTens * 10)));

        this.model.thousands = remainingThousands;
        this.model.hundreds = remainingHundreds;
        this.model.tens = remainingTens;
        this.model.ones = remainingOnes;

        for (let i = 0; i < remainingThousands; i++) {
            const clonedItem = this.$el.find(".draggables .thousands-draggable").clone();
            this.$el.find(".thousands-droppable .drop-zone:first-child").append(clonedItem);
            clonedItem.addClass("cloned-item");
        }

        for (let i = 0; i < remainingHundreds; i++) {
            const clonedItem = this.$el.find(".draggables .hundreds-draggable").clone();
            this.$el.find(".hundreds-droppable .drop-zone:first-child").append(clonedItem);
            clonedItem.addClass("cloned-item");
        }

        for (let i = 0; i < remainingTens; i++) {
            const clonedItem = this.$el.find(".draggables .tens-draggable").clone();
            this.$el.find(".tens-droppable .drop-zone:first-child").append(clonedItem);
            clonedItem.addClass("cloned-item");
        }

        for (let i = 0; i < remainingOnes; i++) {
            const clonedItem = this.$el.find(".draggables .ones-draggable").clone();
            this.$el.find(".ones-droppable .drop-zone:first-child").append(clonedItem);
            clonedItem.addClass("cloned-item");
        }
    }

    private _showSubtractAnswer() {
        this.emptyDropSlots();
        this._fillDropSlots(this.model.numbers[0] - this.model.numbers[1]);
        this._emptyTrash();
        this._fillTrash(this.model.numbers[1]);
        this.checkTrashEmpty();
        this.clearValidation();
    }

    private _fillTrash(remainingValue: number) {
        const remainingThousands = Math.floor(remainingValue / 1000);
        const remainingHundreds = Math.floor((remainingValue - (remainingThousands * 1000)) / 100);
        const remainingTens = Math.floor((remainingValue - (remainingThousands * 1000) - (remainingHundreds * 100)) / 10);
        const remainingOnes = Math.floor((remainingValue - (remainingThousands * 1000) - (remainingHundreds * 100) - (remainingTens * 10)));
        for (let i = 0; i < remainingThousands; i++) {
            const clonedItem = this.$el.find(".draggables .thousands-draggable").clone();
            const type = clonedItem.data("type");
            this.$el.find(`.trash-area .trashed-droppables[data-trash-type=${type}]`).append(clonedItem);
        }
        for (let i = 0; i < remainingHundreds; i++) {
            const clonedItem = this.$el.find(".draggables .hundreds-draggable").clone();
            const type = clonedItem.data("type");
            this.$el.find(`.trash-area .trashed-droppables[data-trash-type=${type}]`).append(clonedItem);
        }
        for (let i = 0; i < remainingTens; i++) {
            const clonedItem = this.$el.find(".draggables .tens-draggable").clone();
            const type = clonedItem.data("type");
            this.$el.find(`.trash-area .trashed-droppables[data-trash-type=${type}]`).append(clonedItem);
        }
        for (let i = 0; i < remainingOnes; i++) {
            const clonedItem = this.$el.find(".draggables .ones-draggable").clone();
            const type = clonedItem.data("type");
            this.$el.find(`.trash-area .trashed-droppables[data-trash-type=${type}]`).append(clonedItem);
        }
    }

    private _emptyTrash() {
        this.$(".trash-area .draggable").remove();
    }

    private triggerChangeEvent() {
        this.trigger("changed");
    }

    private _saveData() {
        const data = this._generateDataToBeSaved();
        this.trigger("save-data", data);
    }

    private _generateDataToBeSaved() {
        return {
            hundreds: this.model.hundreds,
            ones: this.model.ones,
            tens: this.model.tens,
            thousands: this.model.thousands
        };
    }
    // tslint:disable-next-line:max-file-line-count
}
