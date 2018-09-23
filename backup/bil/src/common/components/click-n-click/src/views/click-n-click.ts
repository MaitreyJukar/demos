import * as Backbone from "backbone";
import * as _ from "underscore";
import "../../css/click-n-click.styl";
import * as ClickNClickPkg from "../models/click-n-click";

export interface ExtWindow extends Window {
    BIL: any;
}
declare const window: ExtWindow;

const clickNClickTemplate: (attr?: any) => string = require("./../../tpl/click-n-click.hbs");

export class ClickNClick extends Backbone.View<ClickNClickPkg.ClickNClick> {
    constructor(attr?: Backbone.ViewOptions<ClickNClickPkg.ClickNClick>) {
        super(attr);
        this.render();
    }

    public events(): Backbone.EventsHash {
        return {
            "click .counter": this.onCounterClick
        };
    }

    public render(): ClickNClick {
        this.$el.html(clickNClickTemplate(this._getTemplateData()));
        this._renderFromSavedData();
        this.addDefaultCounters();
        return this;
    }

    public validate(): boolean {
        const flag = this._validateClickNClick();
        const validationClass = flag ? "correct" : "incorrect";
        this._addValidation(validationClass);
        this.disable();
        if (flag) {
            this._saveData();
        }
        return flag;
    }

    public enable() {
        this._clearValidation();
        this.$(".click-n-click-container").removeClass("disabled");
    }

    public disable() {
        this.$(".click-n-click-container").addClass("disabled");
    }

    public showAnswer() {
        this._showValidAnswer();
        this.$(".click-n-click-container").addClass("answer-shown");
        this._saveData();
        this.disable();
    }

    public clearValidation() {
        this.$(".counter.selected").removeClass("selected");
        this.$(".click-n-click-container").removeClass("correct incorrect answer-shown disabled");
    }

    public finish() {
        // Functions to be called on clicking next or continue
    }

    private _renderFromSavedData() {
        switch (this.model.fetchDataType) {
            case ClickNClickPkg.SAVE_DATA_TYPES.BASIC:
                this._renderBasicSavedData();
                break;
            case ClickNClickPkg.SAVE_DATA_TYPES.CUSTOM:
                this._renderCustomSavedData();
        }
    }

    private _renderBasicSavedData() {
        if (this.model.savedData.data) {
            this.addFetchedCounters();
        }
    }

    private addDefaultCounters() {
        for (const counterArea of this.model.counterArea) {
            const counters = counterArea.counters;
            for (const counter of counters) {
                const div = document.createElement("div");
                div.classList.add("counter");
                div.setAttribute("type", counter.type);
                let count = counter.count;
                while (count > 0) {
                    this.$(".counter-area[type=" + counterArea.type + "]").append($(div).clone());
                    count--;
                }
            }
        }
    }

    private addFetchedCounters() {
        for (const counter of this.model.savedData.data) {
            const div = document.createElement("div");
            div.classList.add("counter");
            div.style.left = counter.left;
            div.style.top = counter.top;
            div.setAttribute("type", counter.type);

            this.$(".counters-wrapper").append(div);
        }
    }

    private _renderCustomSavedData() {
        if (this.model.fetchDataFn) {
            window.BIL.CustomJS[this.model.fetchDataFn](this, this.model);
        }
    }

    private onCounterClick(event: JQueryEventObject) {
        this._triggerChangeEvent();
        const counter = event.target;
        if (this.model.type === ClickNClickPkg.TOOL_TYPE.RADIO) {
            this.$(".counter").not(counter).removeClass("selected");
        }
        $(counter).toggleClass("selected");
    }

    /** Validation functions */
    private _getTemplateData() {
        return {
            counterArea: this.model.counterArea
        };
    }

    private _addValidation(validation: string) {
        this._clearValidation();
        this.$(".click-n-click-container").addClass(validation);
    }

    private _clearValidation() {
        this.$(".click-n-click-container").removeClass("correct incorrect");
    }

    private _triggerChangeEvent() {
        this._clearValidation();
        this.trigger("changed");
    }

    private _saveData() {
        const data = this._generateDataToBeSaved();
        this.trigger("save-data", data);
    }

    private _generateDataToBeSaved() {
        const type = this.model.saveDataType;
        const SAVE_DATA_TYPES = ClickNClickPkg.SAVE_DATA_TYPES;
        switch (type) {
            case SAVE_DATA_TYPES.CUSTOM:
                return this._generateSaveDataForCustom();
            default:
                return;
        }
    }

    private _generateSaveDataForCustom() {
        const data = {
            data: this._getCustomDataToSave(),
            type: ClickNClickPkg.SAVE_DATA_TYPES.CUSTOM
        };
        return data;
    }

    private _getCustomDataToSave() {
        if (window.BIL.CustomJS) {
            return window.BIL.CustomJS[this.model.saveDataFn](this.model, this);
        }
        return {};
    }

    private _validateClickNClick(): boolean {
        const type = this.model.validationType;
        const VALIDATION_TYPES = ClickNClickPkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.BASIC:
                return this._validateBasicAnswer();
            case VALIDATION_TYPES.CUSTOM:
                return this._validateCustom();
            case VALIDATION_TYPES.COUNTERTYPE:
                return this._validateCounterType();
            default:
                return true;
        }
    }

    private _validateBasicAnswer(): boolean {
        const counterLength = this.$(".counter").length;
        const selectedCounterLength = this.$(".counter.selected").length;
        return counterLength === selectedCounterLength;
    }

    private _validateCustom(): boolean {
        return window.BIL.CustomJS[this.model.validationFn](this, this.model);
    }

    private _validateCounterType(): boolean {
        const counterLength = this.$(".selected.counter[type=" + this.model.validationData.counterType + "]").length;
        const selectedCounterLength = this.$(".counter.selected").length;
        const counterTypeLength = this.$(".counter[type=" + this.model.validationData.counterType + "]").length;
        return counterLength === selectedCounterLength && selectedCounterLength === counterTypeLength;
    }

    private _showValidAnswer() {
        this._clearValidation();
        const type = this.model.validationType;
        const VALIDATION_TYPES = ClickNClickPkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.BASIC:
                this._showBasicAnswer();
                break;
            case VALIDATION_TYPES.CUSTOM:
                this._showCustomAnswer();
                break;
            case VALIDATION_TYPES.COUNTERTYPE:
                this._showCounterTypeAnswer();
                break;
            default:
        }
    }

    private _showBasicAnswer() {
        this.$(".counter").addClass("selected");
    }

    private _showCustomAnswer() {
        window.BIL.CustomJS[this.model.showAnswerFn](this, this.model);
    }
    private _showCounterTypeAnswer() {
        this.$(".counter.selected").removeClass("selected");
        this.$(".counter[type=" + this.model.validationData.counterType + "]").addClass("selected");
    }
}
