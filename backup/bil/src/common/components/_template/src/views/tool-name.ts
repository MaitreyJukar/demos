import * as Backbone from "backbone";
import * as _ from "underscore";
import "../../css/tool-name.styl";
import * as ToolNamePkg from "../models/tool-name";

export interface ExtWindow extends Window {
    BIL: any;
}
declare const window: ExtWindow;

const toolNameTemplate: (attr?: any) => string = require("./../../tpl/tool-name.hbs");

export class ToolName extends Backbone.View<ToolNamePkg.ToolName> {
    constructor(attr?: Backbone.ViewOptions<ToolNamePkg.ToolName>) {
        super(attr);
        this.render();
    }

    public events(): Backbone.EventsHash {
        return {};
    }

    public render(): ToolName {
        this.$el.html(toolNameTemplate());
        return this;
    }

    public validate(): boolean {
        const flag = this._validateToolName();
        const validationClass = flag ? "correct" : "incorrect";
        this._addValidation(validationClass);
        if (flag) {
            this._saveData();
        }
        return flag;
    }

    public enable() {
        this._clearValidation();
        this.$(".tool-name-container").removeClass("disabled");
    }

    public disable() {
        this.$(".tool-name-container").addClass("disabled");
    }

    public showAnswer() {
        this._showValidAnswer();
        this.$(".tool-name-container").addClass("answer-shown");
        this._saveData();
    }

    public clearValidation() {
        // Functions to be called on clicking try again
    }

    public finish() {
        // Functions to be called on clicking next or continue
    }

    /** Validation functions */

    private _addValidation(validation: string) {
        this._clearValidation();
        this.$(".tool-name-container").addClass(validation);
    }

    private _clearValidation() {
        this.$(".tool-name-container").removeClass("correct incorrect");
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
        const SAVE_DATA_TYPES = ToolNamePkg.SAVE_DATA_TYPES;
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
            type: ToolNamePkg.SAVE_DATA_TYPES.CUSTOM
        };
        return data;
    }

    private _getCustomDataToSave() {
        if (window.BIL.CustomJS) {
            return window.BIL.CustomJS[this.model.saveDataFn](this.model, this);
        }
        return {};
    }

    private _validateToolName(): boolean {
        const type = this.model.validationType;
        const VALIDATION_TYPES = ToolNamePkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.BASIC:
                return this._validateBasicAnswer();
            case VALIDATION_TYPES.CUSTOM:
                return this._validateCustom();
            default:
                return true;
        }
    }

    private _validateBasicAnswer(): boolean {
        // Validate basic answer
        return false;
    }

    private _validateCustom(): boolean {
        return window.BIL.CustomJS[this.model.validationFn](this, this.model);
    }

    private _showValidAnswer() {
        this._clearValidation();
        const type = this.model.validationType;
        const VALIDATION_TYPES = ToolNamePkg.VALIDATION_TYPES;
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
        // Implement basic answer functionality
    }

    private _showCustomAnswer() {
        window.BIL.CustomJS[this.model.showAnswerFn](this, this.model);
    }
}
