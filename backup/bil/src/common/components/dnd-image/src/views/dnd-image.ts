import * as Backbone from "backbone";
import * as _ from "underscore";

// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jqueryui";
// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jquery-ui-touch-punch";

import "../../css/dnd-image.styl";
import * as DNDImagePkg from "../models/dnd-image";

const DNDImageTemplate: (attr?: any) => string = require("./../../tpl/dnd-image.hbs");
const DNDRandomButtonTemplate: (attr?: any) => string = require("./../../tpl/button.hbs");

export interface ExtWindow extends Window {
    BIL: any;
}
declare const window: ExtWindow;

export class DNDImage extends Backbone.View<DNDImagePkg.DNDImage> {
    constructor(attr?: Backbone.ViewOptions<DNDImagePkg.DNDImage>) {
        super(attr);
        this.render()
            .initializeItems()
            ._setInitialState();
    }

    public events(): Backbone.EventsHash {
        return {
            "click .dnd-show-me-btn:not([disabled])": this._showOnlyShowMeAnswer.bind(this),
            "click .dnd-tool-random-button": this._randomBtnClicked.bind(this)
        };
    }

    public render(): DNDImage {
        this.$el.html(DNDImageTemplate(this._getTemplateOptions()));
        this.createToolType();
        return this;
    }

    public validate(): boolean {
        const flag = this._validateDND();
        const validationClass = flag ? "correct" : "incorrect";
        this._addValidation(validationClass);
        if (flag) {
            this._saveData();
        }
        return flag;
    }

    public enable() {
        this._clearValidation();
        this.$(".dnd-image-container").removeClass("disabled");
        this._enableDragging();
        this._enableDropping();
        this._enableButtons();
    }

    public disable() {
        this.$(".dnd-image-container").addClass("disabled");
        this._disableDragging();
        this._disableDropping();
        this._disableButtons();
    }

    public showAnswer() {
        this._showValidAnswer();
        this.$(".dnd-image-container").addClass("answer-shown");
        if (this.model.keepShowAnswer) {
            this._saveData();
        }
    }

    /**
     * Called on clicking Try Again in the player
     */
    public clearValidation() {
        this.render()
            .initializeItems()
            ._setInitialState();
    }

    public finish() {
        this._saveData();
        if (this.model.showMe) {
            this.disable();
        }
    }

    private _getTemplateOptions() {
        return {
            alttext: this.model.alttext,
            dispenser: this.model.dispenser,
            dispenserOnLeft: this._isDispenserOnLeft(),
            dispenserPos: this.model.dispenserPos,
            draggables: this.model.draggables,
            dropZones: this.model.dropZones,
            showMe: this.model.showMe
        };
    }

    private _isDispenserOnLeft() {
        return this.model.dispenserPos === "left" || this.model.dispenserPos === "top";
    }

    private initializeItems(): DNDImage {
        return this._initializeDroppables()
            ._initializeDraggables();
    }

    private _initializeDraggables(): DNDImage {
        this.$(".counter-zone .drag-counter").draggable({
            appendTo: this.$(".drop-zone-area"),
            helper: "clone",
            revert: "invalid"
        });
        return this;
    }

    private _initializeDroppables(): DNDImage {
        for (const dropZone of this.model.dropZones) {
            const $dropEl = this.$(`.drop-zone[type=${dropZone.type}]`);
            $dropEl.css({
                height: dropZone.height,
                left: dropZone.left,
                top: dropZone.top,
                width: dropZone.width
            });
            $dropEl.droppable({
                accept: this._allowDrop.bind(this, dropZone, $dropEl),
                drop: this._onDrop.bind(this),
                tolerance: dropZone.tolerance ? dropZone.tolerance : "intersect"
            });
        }
        return this;
    }

    private _setInitialState() {
        this._renderPrefilledData();
        if (this.model.disabled) {
            this.disable();
        }
        if (this.model.checkEnabled) {
            _.delay(this._triggerChangeEvent.bind(this), 10);
        }
    }

    private createToolType() {
        switch (this.model.toolType) {
            case DNDImagePkg.TOOL_TYPE.NEW_COUNTERS:
                this.$(".counter-zone").data("curr-visible-child", 0).children().not(":first").addClass("invisible");
                break;
            case DNDImagePkg.TOOL_TYPE.RANDOM_COUNTERS:
            case DNDImagePkg.TOOL_TYPE.RANDOM_LINKED_COUNTERS:
                this.$(".left-section").append(DNDRandomButtonTemplate());
                this.renderRandomToolType();
        }
    }

    private renderRandomToolType() {
        for (const dropZone of this.model.dropZones) {
            if (dropZone.isRandomCounter || dropZone.type === 1) {
                this.model.randomCounterData = {
                    isCircular: dropZone.isCircular,
                    max: dropZone.max,
                    type: dropZone.type
                };
            }
        }
    }

    private _renderPrefilledData() {
        this._fillDroppedCounters();
        this._fillDynamicSaveData();
        this._updateFromCustomSavedData();
    }

    private _fillDroppedCounters() {
        for (const dropZone of this.model.dropZones) {
            const $dropZones = this.$(`.drop-zone[type=${dropZone.type}]`).first();
            if (dropZone.dropped && dropZone.dropped.length) {
                for (const dragData of dropZone.dropped) {
                    const $counter = this.$(`.counter-zone .drag-counter[type=${dragData.type}]`);
                    for (let i = 0; i < dragData.count; i++) {
                        const $clone = $counter.clone();
                        if (this.model.toolType === DNDImagePkg.TOOL_TYPE.NEW_COUNTERS) {
                            $clone.removeClass("invisible");
                        }
                        $clone.attr("keep", Number(dragData.keep));
                        this._setPositionFromSavedData($clone, dropZone.type, dragData.type, i);
                        $dropZones.find(".dropped-counters").append($clone);
                        if (dragData.drag === false) {
                            $clone.addClass("do-not-drag");
                        } else {
                            this._makeCloneDraggable($clone);
                        }
                    }
                }
            }
        }
    }

    private _fillDynamicSaveData() {
        const savedData = this.model.savedData;
        if (savedData &&
            savedData.type === DNDImagePkg.SAVE_DATA_TYPES.DYNAMIC_POS &&
            this.model.fetchDataType === DNDImagePkg.SAVE_DATA_TYPES.DYNAMIC_POS) {
            for (const dropZoneType in savedData.droppedData) {
                if (savedData.droppedData[dropZoneType]) {
                    const $dropZone = this.$(`.drop-zone[type=${dropZoneType}]`).first();
                    const dropZone = savedData.droppedData[dropZoneType];
                    if (dropZone.dropped) {
                        for (const dragDataType in dropZone.dropped) {
                            if (dropZone.dropped[dragDataType]) {
                                const dragData = dropZone.dropped[dragDataType];
                                const $counter = this.$(`.counter-zone .drag-counter[type=${dragDataType}]`);
                                for (const counterData of dragData) {
                                    const $clone = $counter.clone();
                                    if (this.model.toolType === DNDImagePkg.TOOL_TYPE.NEW_COUNTERS) {
                                        $clone.removeClass("invisible");
                                    }
                                    $clone.attr("keep", 1);
                                    $clone.css(counterData);
                                    $dropZone.find(".dropped-counters").append($clone);
                                    if (this._shouldBeDraggable(dropZoneType, dragDataType)) {
                                        this._makeCloneDraggable($clone);
                                    } else {
                                        $clone.addClass("do-not-drag");
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private _updateFromCustomSavedData() {
        const savedData = this.model.savedData;
        if (savedData &&
            savedData.type === DNDImagePkg.SAVE_DATA_TYPES.CUSTOM &&
            this.model.fetchDataType === DNDImagePkg.SAVE_DATA_TYPES.CUSTOM) {
            window.BIL.CustomJS[this.model.fetchDataFn](this.model, this, savedData);
        }
    }

    private _shouldBeDraggable(dropZoneType: string, dragType: string) {
        return this.model.enableSavedDragging &&
            this.model.enableSavedDragging[dropZoneType] &&
            this.model.enableSavedDragging[dropZoneType].indexOf(dragType) > -1;
    }

    private _setPositionFromSavedData($el: JQuery<HTMLElement>, dropZoneType: any, dragType: any, idx: number) {
        const savedData = this.model.savedData;
        if (savedData &&
            savedData.type === DNDImagePkg.SAVE_DATA_TYPES.FIXED_POS &&
            this.model.fetchDataType === DNDImagePkg.SAVE_DATA_TYPES.FIXED_POS) {
            if (savedData.droppedData[dropZoneType]) {
                if (savedData.droppedData[dropZoneType].dropped) {
                    if (savedData.droppedData[dropZoneType].dropped[dragType]) {
                        if (savedData.droppedData[dropZoneType].dropped[dragType][idx]) {
                            $el.css(savedData.droppedData[dropZoneType].dropped[dragType][idx]);
                        }
                    }
                }
            }
        }
    }

    private _allowDrop(dropZone: DNDImagePkg.DropZone, $dropEl: JQuery<HTMLElement>, $dragCounter: JQuery<HTMLElement>) {
        const selector = this._getAcceptedSelector(dropZone.allow);
        return $.contains(this.$el[0], $dragCounter[0]) &&
            $dragCounter.is(selector) &&
            this._checkDropZoneMax(dropZone, $dropEl) &&
            this._checkDragTypeMax(dropZone, $dropEl, $dragCounter) &&
            this._checkToolMax() &&
            this._isInPath($dropEl);
    }

    private _isInPath($dropEl: JQuery<HTMLElement>, $dragHelper?: JQuery<HTMLElement>): boolean {
        $dragHelper = ($dragHelper && $dragHelper.length) ? $dragHelper : this.$(".ui-draggable-dragging");
        const $path = $dropEl.find("path");
        if (!$path.length || !$dragHelper.length) {
            return true;
        }
        return this._isPointInPath($path, this._getPointsToCheck($dragHelper));
    }

    private _getPointsToCheck($dragCounter: JQuery<HTMLElement>): any[] {
        const type = $dragCounter.attr("type");
        const rect = $dragCounter[0].getBoundingClientRect();
        const points = [{
            x: rect.left + (rect.width / 2),
            y: rect.top + (rect.height / 2)
        }];
        this._addControlPoints(points, type, rect);
        return points;
    }

    private _addControlPoints(points: any[], type: string, rect: ClientRect | DOMRect) {
        const draggableData = this.model.getDraggableDataByType(type);
        if (draggableData.controlPoints) {
            for (const point of draggableData.controlPoints) {
                points.push({
                    x: rect.left + point[0],
                    y: rect.top + point[1]
                });
            }
        }
    }

    private _isPointInPath($path: JQuery<HTMLElement>, points: any[]): boolean {
        let elems: any;
        for (const point of points) {
            elems = this._getElementsFromPoint(point.x, point.y);
            if (elems.indexOf($path[0]) > -1) {
                return true;
            }
        }
        return false;
    }

    private _getElementsFromPoint(x: number, y: number) {
        if (document.elementsFromPoint) {
            return document.elementsFromPoint(x, y);
        } else if (document.msElementsFromPoint) {
            return Array.prototype.slice.call(document.msElementsFromPoint(x, y));
        }
        return [];
    }

    private _checkDropZoneMax(dropZone: DNDImagePkg.DropZone, $dropEl: JQuery<HTMLElement>): boolean {
        return (dropZone.max == null ||
            dropZone.max === -1 ||
            $dropEl.find(".drag-counter:not(.is-dragging)").length < dropZone.max);
    }

    private _checkDragTypeMax(dropZone: DNDImagePkg.DropZone, $dropEl: JQuery<HTMLElement>, $dragCounter: JQuery<HTMLElement>): boolean {
        const type = $dragCounter.attr("type");
        return (dropZone.maxTypes == null ||
            dropZone.maxTypes[type] == null ||
            dropZone.maxTypes[type] === -1 ||
            $dropEl.find(`.drag-counter[type=${type}]:not(.is-dragging)`).length < dropZone.maxTypes[type]);
    }

    private _checkToolMax(): boolean {
        return (this.model.max == null ||
            this.model.max === -1 ||
            this.$(".drop-zone .drag-counter:not(.is-dragging)").length < this.model.max);
    }

    private _onDrop(evt: JQueryEventObject, ui: any) {
        const $target = $(evt.target);
        const $helper = $(ui.helper);
        if (!$helper.hasClass("dropped") && this._isInPath($target, $helper)) {
            const $clone = $helper.clone();
            let top = 0;
            let left = 0;
            if (!$target.data("snap")) {
                const parentTop = parseInt($target.css("top"), 10);
                const parentLeft = parseInt($target.css("left"), 10);

                // Recalculate top left of draggables on drop w.r.t. parent
                top = parseInt($clone.css("top"), 10) - parentTop;
                left = parseInt($clone.css("left"), 10) - parentLeft;
                $clone.css({
                    left,
                    top
                });
            } else {
                $clone.css({
                    left: 0,
                    position: "relative",
                    top: 0
                });
            }
            $target.find(".dropped-counters").append($clone);
            this._makeCloneDraggable($clone);
            $helper.addClass("dropped");
            if (this.model.toolType === DNDImagePkg.TOOL_TYPE.NEW_COUNTERS) {
                this._showNextCounter();
            }
            this._triggerChangeEvent();
        }
    }

    private _showNextCounter() {
        // Show next counter in dispenser
        const $counterZone = this.$(".counter-zone");
        const draggableItems = $counterZone.children().length - 1;
        let currVisibleDraggableItem = $counterZone.data("curr-visible-child");

        if (draggableItems === currVisibleDraggableItem) {
            currVisibleDraggableItem = 0;
            $counterZone.children().addClass("invisible").eq(currVisibleDraggableItem).removeClass("invisible");
            $counterZone.data("curr-visible-child", currVisibleDraggableItem);
        } else {
            $counterZone.children().addClass("invisible").eq(currVisibleDraggableItem + 1).removeClass("invisible");
            $counterZone.data("curr-visible-child", currVisibleDraggableItem + 1);
        }
    }

    private _makeCloneDraggable($el: JQuery<HTMLElement>) {
        $el.removeClass("ui-draggable-dragging");
        $el.draggable({
            appendTo: this.$(".drop-zone-area"),
            helper: "clone",
            revert: this._checkRevert.bind(this, $el),
            start: this._onDroppedDragStart.bind(this),
            stop: this._onDroppedDragStop.bind(this)
        });
    }

    private _checkRevert(draggable: JQuery<HTMLElement>, droppable: JQuery<HTMLElement>) {
        if (!droppable) {
            // Revert if not dropped
            if (Number(draggable.attr("keep"))) {
                return true;
            }
        }
        // Remove original draggable if helper dropped
        draggable.remove();
        return false;
    }

    private _onDroppedDragStart(evt: JQueryEventObject) {
        // Remove original draggable
        $(evt.target).addClass("is-dragging");
        this._triggerChangeEvent();
    }

    private _onDroppedDragStop(evt: JQueryEventObject) {
        $(evt.target).removeClass("is-dragging");
    }

    private _randomBtnClicked() {
        if (this.model.toolType === DNDImagePkg.TOOL_TYPE.RANDOM_COUNTERS) {
            this._generateRandomDraggable();
        } else {
            this._generateRandomLinkedDraggables();
        }
    }

    private _generateRandomDraggable() {
        const type = this.model.randomCounterData.type;
        const max = this.model.randomCounterData.max;
        const isCircular = this.model.randomCounterData.isCircular;
        const isMaxCheck = this.$(`.drop-zone-area .drop-zone[type='${type}'] .dropped-counters .drag-counter`).length < max;
        if (isMaxCheck || isCircular) {
            const draggableItemsLength = this.$(".counter-zone .drag-counter").length;
            const randomNo = Math.floor(Math.random() * draggableItemsLength) + 1;
            const $clone = this.$(`.counter-zone .drag-counter[type=${randomNo}]`).clone();
            $clone.removeClass("ui-draggable-disabled");
            this.$(`.drop-zone-area .drop-zone[type='${type}'] .dropped-counters`).append($clone);
            this._makeCloneDraggable($clone);
            if (!isMaxCheck && isCircular) {
                this.$(`.drop-zone-area .drop-zone[type='${type}'] .dropped-counters`).children().eq(0).remove();
            }
            this._triggerChangeEvent();
        }
    }

    private _generateRandomLinkedDraggables() {
        const data = this.model.randomGenerationData;
        for (const dropType of data.zones) {
            const $dropZone = this.$(`.drop-zone[type='${dropType}'] .dropped-counters`);
            // Clear dropzone
            $dropZone.html("");
            const count = data.count - this._getCumulativeMinCount(data);
            const splits = this._getSplits(data, count);
            for (const dragType of data.types) {
                const $counter = this.$(`.counter-zone .drag-counter[type=${dragType}]`);
                for (let i = 0; i < splits[dragType]; i++) {
                    const $clone = $counter.clone();
                    $dropZone.append($clone);
                }
            }
        }
        this._disableDragging();
        this._triggerChangeEvent();
    }

    private _getCumulativeMinCount(data: DNDImagePkg.RandomGenerationData): number {
        let count = 0;
        for (const dragType in data.min) {
            if (data.min[dragType]) {
                count += data.min[dragType];
            }
        }
        return count;
    }

    private _getSplits(data: DNDImagePkg.RandomGenerationData, count: number): any {
        const splits = {};
        const origCount = count;
        let dragType = null;
        for (dragType of data.types) {
            const currCount = _.random(0, count);
            count -= currCount;
            splits[dragType] = currCount + data.min[dragType];
        }
        splits[dragType] += count;
        const prevData = this._getPreviousData();
        if (prevData) {
            let bFlag = false;
            for (const currData of prevData) {
                const key = "" + (prevData.indexOf(currData) + 1);
                if (currData == splits[key]) {
                    bFlag = true;
                    break;
                }
            }
            if (bFlag) {
                return this._getSplits(data, origCount);
            }
        }
        return splits;
    }

    private _getPreviousData(): number[] {
        if (this.model.fetchDataType === "custom") {
            return this.model.savedData.data;
        }
        return [];
    }

    private _getAcceptedSelector(allowedTypes: number[]) {
        if (allowedTypes && allowedTypes.length) {
            return allowedTypes
                .map((type: number) => `.drag-counter[type=${type}]`)
                .join(",");
        }
        return ".drag-counter";
    }

    private _addValidation(validation: string) {
        this._clearValidation();
        this.$(".dnd-image-container").addClass(validation);
    }

    private _clearValidation() {
        this.$(".dnd-image-container").removeClass("correct incorrect");
    }

    private _clearCounterValidation() {
        this.$(".drag-counter").removeClass("correct incorrect");
    }

    private _triggerChangeEvent() {
        this._clearValidation();
        this._clearCounterValidation();
        this._enableShowMe();
        this.trigger("changed");
    }

    private _validateDND(): boolean {
        const type = this.model.validationType;
        const VALIDATION_TYPES = DNDImagePkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.ALT_ANS:
                return this._validateAlternateAnswers();
            case VALIDATION_TYPES.ALT_ANS_COUNT:
                return this._validateAlternateAnswerCount();
            case VALIDATION_TYPES.BASIC:
                return this._validateBasic();
            case VALIDATION_TYPES.COUNT:
                return this._validateCount();
            case VALIDATION_TYPES.DYNAMIC_COUNT:
                return this._validateDynamicCount();
            case VALIDATION_TYPES.CUSTOM:
                return this._validateCustom();
            case VALIDATION_TYPES.BASE_TEN_COUNT:
                return this._validateBaseTenCount();
            default:
                return true;
        }
    }

    private _validateAlternateAnswers(): boolean {
        const $droppedCounters = this.$(".drop-zone .drag-counter");
        const droppedCounters = $droppedCounters.length;
        const totalValidCounters = this.model.getTotalValidCounters();
        let isValid = droppedCounters === totalValidCounters;
        const validationData = this.model.validationData;
        const answers = validationData.answers;
        const possibleAnswers = answers.length;
        loop1:
        for (const [index, dropZoneData] of answers.entries()) {
            const dropZones: DNDImagePkg.DropZone[] = dropZoneData.dropZones;
            for (const dropZone of dropZones) {
                const $dropZones = this.$(`.drop-zone[type=${dropZone.type}]`);
                if (dropZone.answer) {
                    for (const dragData of dropZone.answer) {
                        const $counters = $dropZones.find(`.drag-counter[type=${dragData.type}]`);
                        isValid = isValid && ($counters.length === dragData.count);
                        if (!isValid) {
                            if (index < possibleAnswers - 1) {
                                isValid = true;
                            }
                            continue loop1;
                        }
                    }
                }
            }
            if (isValid) {
                break;
            }
        }
        return isValid;
    }

    private _validateAlternateAnswerCount(): boolean {
        // Total dropped counters
        const $droppedCounters = this.$(".drop-zone .drag-counter");
        const droppedCounters = $droppedCounters.length;
        // Total valid drop counters
        const totalValidCounters = this.model.getTotalValidCounters();
        let isValid = droppedCounters === totalValidCounters;
        const validationData = this.model.validationData;
        const answers = validationData.answers;
        const possibleAnswers = answers.length;
        loop1:
        for (const [index, dropZoneData] of answers.entries()) {
            const dropZones = dropZoneData.dropZones;
            for (const dropZone of dropZones) {
                const $dropZones = this.$(`.drop-zone[type=${dropZone.type}]`);
                if (dropZone.answer) {
                    isValid = isValid && $dropZones.find(".drag-counter").length === dropZone.answer.count;
                    if (!isValid) {
                        if (index < possibleAnswers - 1) {
                            isValid = true;
                        }
                        continue loop1;
                    }
                }
            }
            if (isValid) {
                break;
            }
        }
        return isValid;
    }

    private _validateBasic(): boolean {
        const $droppedCounters = this.$(".drop-zone .drag-counter");
        const droppedCounters = $droppedCounters.length;
        const totalValidCounters = this.model.getTotalValidCounters();
        let isValid = droppedCounters === totalValidCounters;
        $droppedCounters.addClass("incorrect");
        for (const dropZone of this.model.dropZones) {
            const $dropZones = this.$(`.drop-zone[type=${dropZone.type}]`);
            if (dropZone.answer) {
                for (const dragData of dropZone.answer) {
                    const $counters = $dropZones.find(`.drag-counter[type=${dragData.type}]`);
                    const end = Math.min($counters.length, dragData.count);
                    for (let i = 0; i < end; i++) {
                        $counters.eq(i).removeClass("incorrect").addClass("correct");
                    }
                    isValid = isValid && ($counters.length === dragData.count);
                }
            }
        }
        return isValid;
    }

    private _validateCount(): boolean {
        return this.model.validationData.count === this.$(".drop-zone .drag-counter").length;
    }

    private _validateDynamicCount(): boolean {
        let ansCount = 0;
        let dragCounterCount = 0;
        const validationData = this.model.validationData;
        let minItemsCondition = true;

        if (validationData.minDragItemsData) {
            for (const currDragItem of validationData.minDragItemsData.dragItems) {
                if (!(this.$(`.drop-zone .drag-counter[type=${currDragItem}]:not(.do-not-drag)`).length >=
                    validationData.minDragItemsData.minCount)) {
                    minItemsCondition = false;
                    break;
                }
            }
        }

        for (const currValidationData of validationData.dropZoneData) {
            ansCount = currValidationData.isTotalCount ? currValidationData.count : ansCount + currValidationData.count;
            if (typeof currValidationData.minCount !== "undefined" && !(currValidationData.minCount >=
                this.$(`.drop-zone[type=${currValidationData.dropZonetype}] .drag-counter`).length)) {
                minItemsCondition = false;
            }
            dragCounterCount += this.$(`.drop-zone[type=${currValidationData.dropZonetype}] .drag-counter`).length;
        }
        return ansCount === dragCounterCount && minItemsCondition;
    }

    private _dropAnswerCountValidation() {
        const dropzones = this.model.validationData.dropzone;
        let isValid = true;
        for (const dropzone of dropzones) {
            const drop = ".drop-zone[type='" + dropzone.type + "']";
            const drag1 = this.$(drop + " .drag-counter[type='1']").length;
            const drag2 = this.$(drop + " .drag-counter[type='2']").length;
            const drag3 = this.$(drop + " .drag-counter[type='3']").length;
            const drag4 = this.$(drop + " .drag-counter[type='4']").length;

            if (drag1 * 1 + drag2 * 10 + drag3 * 100 + drag4 * 1000 !== dropzone.count) {
                isValid = false;
                break;
            }
        }
        return isValid;
    }
    private _totalCountValidation() {
        const totalCount = this.model.validationData.count;
        let isValid = true;
        const dropzones = ".drop-zone";
        const dropzoneTypes = this.model.validationData.dropzones;
        if (dropzoneTypes) {
            for (const dropzone of dropzoneTypes) {
                let dropType = 0;
                for (const val of dropzone.drag) {
                    dropType += this.$(".drop-zone[type='" + dropzone.type + "'] .drag-counter[type='" + val + "']").length;
                }
                const dropCount = this.$(".drop-zone[type='" + dropzone.type + "'] .drag-counter").length;
                if ((dropCount - dropType) > 0) {
                    isValid = isValid && false;
                }
            }
        }
        const drag1 = this.$(dropzones + " .drag-counter[type='1']").length;
        const drag2 = this.$(dropzones + " .drag-counter[type='2']").length;
        const drag3 = this.$(dropzones + " .drag-counter[type='3']").length;
        const drag4 = this.$(dropzones + " .drag-counter[type='4']").length;
        isValid = isValid && (drag1 * 1 + drag2 * 10 + drag3 * 100 + drag4 * 1000 === totalCount);
        return isValid;
    }

    private _validateBaseTenCount() {
        let isValid = true;
        const validArea = this.model.validationData.validationArea;
        switch (validArea) {
            case "dropzone":
                isValid = this._dropAnswerCountValidation();
                break;
            case "all":
                isValid = this._totalCountValidation();
        }
        return isValid;
    }

    private _validateCustom() {
        return window.BIL.CustomJS[this.model.validationFn](this, this.model);
    }

    private _showValidAnswer() {
        this._clearValidation();
        const type = this.model.validationType;
        const VALIDATION_TYPES = DNDImagePkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.ALT_ANS:
            case VALIDATION_TYPES.ALT_ANS_COUNT:
            case VALIDATION_TYPES.BASIC:
            case VALIDATION_TYPES.COUNT:
            case VALIDATION_TYPES.BASE_TEN_COUNT:
                this._showBasicAnswer();
                break;
            case VALIDATION_TYPES.DYNAMIC_COUNT:
                this._showDynamicCountAnswer();
                break;
            case VALIDATION_TYPES.CUSTOM:
                this._showCustomAnswer();
                break;
            default:
        }
    }

    private _showBasicAnswer() {
        this._clearDroppedCounters();
        for (const dropZone of this.model.dropZones) {
            const $dropZones = this.$(`.drop-zone[type=${dropZone.type}]`).first();
            for (const dragData of dropZone.answer) {
                const $counter = this.$(`.counter-zone .drag-counter[type=${dragData.type}]`);
                const count = dragData.count - $dropZones.find(`.drag-counter[type=${dragData.type}]`).length;
                for (let i = 0; i < count; i++) {
                    const $clone = $counter.clone();
                    if (this.model.toolType === DNDImagePkg.TOOL_TYPE.NEW_COUNTERS) {
                        $clone.removeClass("invisible");
                    }
                    $dropZones.find(".dropped-counters").append($clone);
                }
            }
        }
    }

    private _showDynamicCountAnswer() {
        if (this.model.validationData && this.model.validationData.isShowBaseicAnswer) {
            this._showBasicAnswer();
        } else {
            this._showDynamicDataAnswer();
        }
    }

    private _showDynamicDataAnswer() {
        const isNewCounter = this.model.toolType === DNDImagePkg.TOOL_TYPE.NEW_COUNTERS;
        let ansCount = 0;
        const alldragItemsCount = this.getAllDraggableItemsCount();
        for (const dropZone of this.model.dropZones) {
            const $dropZones = this.$(`.drop-zone[type=${dropZone.type}]`).first();
            const currDropZoneData = this.model.getDropZoneValidationData(dropZone.type);
            $dropZones.find(".drag-counter:not(.do-not-drag)").remove();
            if (currDropZoneData) {
                const draggableItems = currDropZoneData.draggableItemTypes;
                ansCount = currDropZoneData.isTotalCount ? this.getDraggableItemsCount(draggableItems, alldragItemsCount)
                    : currDropZoneData.count;
                const currCount = $dropZones.find(".drag-counter.do-not-drag").length;
                let type: any = "";
                for (let i = 0; i < ansCount; i++) {
                    if (i >= currCount || currCount === 0) {
                        type = draggableItems[Math.floor(Math.random() * draggableItems.length)];
                        const $counter = this.$(`.counter-zone .drag-counter[type=${type}]`);
                        const $clone = $counter.clone();
                        if (isNewCounter) {
                            $clone.removeClass("invisible");
                        }
                        $dropZones.find(".dropped-counters").append($clone);
                    }
                }
            }
        }
    }

    private _showCustomAnswer() {
        window.BIL.CustomJS[this.model.showAnswerFn](this, this.model);
    }

    private getAllDraggableItemsCount() {
        const dragItemsCount = {};
        this.$(".counter-zone .drag-counter").each((i, elem) => {
            const $element = $(elem);
            const type = $element.attr("type");
            dragItemsCount[type] = this.$(`.drop-zone .drag-counter[type=${type}]:not(.do-not-drag)`).length;
        });
        return dragItemsCount;
    }

    private getDraggableItemsCount(arrDragItems: any, allDragItems: {}) {
        let count = 0;
        for (const value of arrDragItems) {
            count += allDragItems[value];
        }
        return count;
    }

    private _enableDragging() {
        this.$(".drag-counter:not(.do-not-drag)").draggable({
            disabled: false
        });
    }

    private _disableDragging() {
        this.$(".drag-counter:not(.do-not-drag)").draggable({
            disabled: true
        });
    }

    private _enableDropping() {
        this.$(".drop-zone").droppable("enable");
    }

    private _enableButtons() {
        if ([DNDImagePkg.TOOL_TYPE.RANDOM_COUNTERS, DNDImagePkg.TOOL_TYPE.RANDOM_LINKED_COUNTERS].indexOf(this.model.toolType) > -1) {
            this.$(".dnd-tool-random-button").removeAttr("disabled");
        }
    }

    private _disableDropping() {
        this.$(".drop-zone").droppable("disable");
    }

    private _disableButtons() {
        if ([DNDImagePkg.TOOL_TYPE.RANDOM_COUNTERS, DNDImagePkg.TOOL_TYPE.RANDOM_LINKED_COUNTERS].indexOf(this.model.toolType) > -1) {
            this.$(".dnd-tool-random-button").attr("disabled", "disabled");
        }
    }

    private _clearDroppedCounters() {
        this.$(".drop-zone .drag-counter:not(.do-not-drag)").remove();
    }

    private _saveData() {
        const data = this._generateDataToBeSaved();
        this.trigger("save-data", data);
    }

    private _generateDataToBeSaved() {
        const type = this.model.saveDataType;
        const SAVE_DATA_TYPES = DNDImagePkg.SAVE_DATA_TYPES;
        switch (type) {
            case SAVE_DATA_TYPES.FIXED_POS:
                return this._generateSaveDataForFixedPos();
            case SAVE_DATA_TYPES.DYNAMIC_POS:
                return this._generateSaveDataForDynamicPos();
            case SAVE_DATA_TYPES.LRN_ANSWERS:
                return this._generateSaveDataForAnswers();
            case SAVE_DATA_TYPES.NUMBER_ADDITION:
                return this._generateSaveDataForNumberAddition();
            case SAVE_DATA_TYPES.CUSTOM:
                return this._generateSaveDataForCustom();
            default:
                return;
        }
    }

    private _generateSaveDataForNumberAddition() {
        const data = {};
        for (const dropzone of this.model.dropZones) {
            const dropped = dropzone.answer[0].type;
            const dropType = dropzone.type;
            data[dropType] = dropped;
        }
        return data;
    }

    private _generateSaveDataForFixedPos() {
        const droppedData: any = {};
        const data = {
            droppedData,
            type: DNDImagePkg.SAVE_DATA_TYPES.FIXED_POS
        };
        for (const dropZone of this.model.dropZones) {
            const $dropZones = this.$(`.drop-zone[type=${dropZone.type}]`);
            const dropped: any = {};
            droppedData[dropZone.type] = {
                dropped
            };
            if (dropZone.answer) {
                for (const dragData of dropZone.answer) {
                    const pos: any[] = [];
                    dropped[dragData.type] = pos;
                    const $counters = $dropZones.find(`.drag-counter[type=${dragData.type}]`);
                    for (let i = 0; i < dragData.count; i++) {
                        const $counter = $counters.eq(i);
                        pos.push({
                            left: $counter.css("left"),
                            position: "absolute",
                            top: $counter.css("top")
                        });
                    }
                }
            }
        }
        return data;
    }

    private _generateSaveDataForDynamicPos() {
        const droppedData: any = {};
        const data = {
            droppedData,
            type: DNDImagePkg.SAVE_DATA_TYPES.DYNAMIC_POS
        };
        for (const dropZone of this.model.dropZones) {
            const $dropZones = this.$(`.drop-zone[type=${dropZone.type}]`);
            const dropped: any = {};
            droppedData[dropZone.type] = {
                dropped
            };
            const $counters = $dropZones.find(".drag-counter");
            $counters.each((i, elem) => {
                const $counter = $(elem);
                const type = $counter.attr("type");
                if (!dropped[type]) {
                    dropped[type] = [];
                }
                dropped[type].push({
                    left: $counter.css("left"),
                    position: "absolute",
                    top: $counter.css("top")
                });
            });
        }
        return data;
    }

    private _generateSaveDataForAnswers() {
        const answers: any[] = [];
        const data = {
            answers,
            type: DNDImagePkg.SAVE_DATA_TYPES.LRN_ANSWERS
        };
        for (const dropZone of this.model.dropZones) {
            answers.push(this.$(`.drop-zone[type=${dropZone.type}] .drag-counter`).length);
        }
        return data;
    }

    private _generateSaveDataForCustom() {
        const data = {
            data: this._getCustomDataToSave(),
            type: DNDImagePkg.SAVE_DATA_TYPES.CUSTOM
        };
        return data;
    }

    private _getCustomDataToSave() {
        if (window.BIL.CustomJS) {
            return window.BIL.CustomJS[this.model.saveDataFn](this.model, this);
        }
        return {};
    }

    private _showOnlyShowMeAnswer() {
        this.showAnswer();
        this.$(".dnd-show-me-btn").hide();
        this.disable();
    }

    private _enableShowMe() {
        this.$(".dnd-show-me-btn").removeAttr("disabled");
    }
}
