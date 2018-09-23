import * as Backbone from "backbone";
import * as _ from "underscore";
import "../../css/custom-desmos.styl";
import * as CustomDesmosPkg from "../models/custom-desmos";

const customDesmosTemplate: (attr?: any) => string = require("./../../tpl/custom-desmos.hbs");

declare let Desmos: any;

export interface ExtWindow extends Window {
    BIL: any;
}
declare const window: ExtWindow;

export class CustomDesmos extends Backbone.View<CustomDesmosPkg.CustomDesmos> {
    public desmos: any;

    constructor(attr?: Backbone.ViewOptions<CustomDesmosPkg.CustomDesmos>) {
        super(attr);
        this.render();
    }

    public events(): Backbone.EventsHash {
        return {};
    }

    public render(): CustomDesmos {
        this.$el.html(customDesmosTemplate());
        this._renderDesmosCalculator();
        return this;
    }

    public enable() {
        this.$(".custom-desmos-container").removeClass("disabled");
    }

    public disable() {
        this.$(".custom-desmos-container").addClass("disabled");
    }

    public showAnswer() {
        this.$(".custom-desmos-container").addClass("answer-shown");
        this._showValidAnswer();
        this._saveData();
        this.disable();
    }

    public validate(): boolean {
        const flag = this._validateDesmos();
        const validationClass = flag ? "correct" : "incorrect";
        this._addValidation(validationClass);
        if (flag) {
            this._saveData();
            this.disable();
        }
        return flag;
    }

    private _renderDesmosCalculator(): void {
        const settings = this.model.settings;

        const desmos = Desmos.GraphingCalculator(this.$(".desmos-graph-holder")[0], settings);

        this.desmos = desmos;
        $.getJSON(this.model.desmosURL).done((resp: any) => {
            desmos.setState(resp.state);
            this._onDesmosRendered();
        }).fail(() => {
            this._onDesmosRendered();
        });
    }

    private _onDesmosRendered() {
        this._renderFromSavedData();
        this._bindChangeListener();
    }

    private _renderFromSavedData() {
        const type = this.model.fetchDataType;
        const SAVE_DATA_TYPES = CustomDesmosPkg.SAVE_DATA_TYPES;
        switch (type) {
            case SAVE_DATA_TYPES.CUSTOM:
                return this._updateFromCustomSavedData();
            default:
                return;
        }
    }

    private _generateSaveDataForCustom() {
        const data = {
            data: this._getCustomDataToSave(),
            type: CustomDesmosPkg.SAVE_DATA_TYPES.CUSTOM
        };
        return data;
    }

    private _getCustomDataToSave() {
        if (window.BIL.CustomJS) {
            return window.BIL.CustomJS[this.model.saveDataFn](this, this.model);
        }
        return {};
    }

    private _updateFromCustomSavedData() {
        const savedData = this.model.savedData;
        if (window.BIL.CustomJS) {
            window.BIL.CustomJS[this.model.fetchDataFn](this, this.model, savedData);
        }
    }

    private _bindChangeListener() {
        this.desmos.observeEvent("change", () => {
            const $container = this.$(".custom-desmos-container");
            if (!$container.hasClass("answer-shown") && !$container.hasClass("disabled")) {
                this._triggerChangeEvent();
            }
        });
    }

    private _triggerChangeEvent() {
        this._clearValidation();
        this.trigger("changed");
    }

    private _addValidation(validation: string) {
        this._clearValidation();
        this.$(".custom-desmos-container").addClass(validation);
    }

    private _clearValidation() {
        this.$(".custom-desmos-container").removeClass("correct incorrect");
    }

    private _validateDesmos(): boolean {
        const type = this.model.validationType;
        const VALIDATION_TYPES = CustomDesmosPkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.CUSTOM:
                return this._validateCustom();
            default:
                return true;
        }
    }

    private _validateCustom() {
        return window.BIL.CustomJS[this.model.validationFn](this, this.model);
    }

    private _showValidAnswer() {
        this._clearValidation();
        const type = this.model.validationType;
        const VALIDATION_TYPES = CustomDesmosPkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.CUSTOM:
                this._showCustomAnswer();
                break;
            default:
        }
    }

    private _showCustomAnswer() {
        window.BIL.CustomJS[this.model.showAnswerFn](this, this.model);
    }

    private _saveData() {
        const data = this._generateDataToBeSaved();
        this.trigger("save-data", data);
    }

    private _generateDataToBeSaved() {
        const type = this.model.saveDataType;
        const SAVE_DATA_TYPES = CustomDesmosPkg.SAVE_DATA_TYPES;
        switch (type) {
            case SAVE_DATA_TYPES.CUSTOM:
                return this._generateSaveDataForCustom();
            default:
                return;
        }
    }
}
