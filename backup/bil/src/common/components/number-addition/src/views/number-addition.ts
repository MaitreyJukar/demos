import * as Backbone from "backbone";
import * as _ from "underscore";
import "../../css/number-addition.styl";
import * as NumberAdditionPkg from "../models/number-addition";

import "../../../../../common/css/bil-numbers.css";

export interface ExtWindow extends Window {
    BIL: any;
}
declare const window: ExtWindow;

const numberAdditionTemplate: (attr?: any) => string = require("./../../tpl/number-addition.hbs");

export class NumberAddition extends Backbone.View<NumberAdditionPkg.NumberAddition> {
    constructor(attr?: Backbone.ViewOptions<NumberAdditionPkg.NumberAddition>) {
        super(attr);
        this.render();
    }

    public events(): Backbone.EventsHash {
        return {
            "click .top-section .number-holder": this.slideCard.bind(this)
        };
    }

    public render(): NumberAddition {
        this.$el.html(numberAdditionTemplate());
        this.addCards();
        return this;
    }
    public addCards() {
        const firstCard = this.$el.find(".first-number-section .number-holder");
        const secondCard = this.$el.find(".second-number-section .number-holder");
        const data = this.model.get("savedData");
        firstCard.addClass("bil-number-" + data[1]);
        secondCard.addClass("bil-number-" + data[2]);
    }

    public validate(): boolean {
        this.disable();
        const flag = this._validateNumberAddition();
        const validationClass = flag ? "correct" : "incorrect";
        this._addValidation(validationClass);
        if (flag) {
            this._saveData();
        }
        return flag;
    }

    public enable() {
        this._clearValidation();
        this.$(".number-addition-container").removeClass("disabled");
        this.$el.find(".top-section .number-holder").removeClass("slide");

    }

    public disable() {
        this.$(".number-addition-container").addClass("disabled");
    }

    public showAnswer() {
        this._showValidAnswer();
        this.$(".number-addition-container").addClass("answer-shown");
        this._saveData();
    }

    public clearValidation() {
        // Implement function to be executed on clicking Try Again in the player
    }

    public finish() {
        this.disable();
    }

    /** Validation functions */

    private _addValidation(validation: string) {
        this._clearValidation();
        this.$(".number-addition-container").addClass(validation);
    }

    private _clearValidation() {
        this.$(".number-addition-container").removeClass("correct incorrect");
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
        const SAVE_DATA_TYPES = NumberAdditionPkg.SAVE_DATA_TYPES;
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
            type: NumberAdditionPkg.SAVE_DATA_TYPES.CUSTOM
        };
        return data;
    }

    private _getCustomDataToSave() {
        if (window.BIL.CustomJS) {
            return window.BIL.CustomJS[this.model.saveDataFn](this.model, this);
        }
        return {};
    }

    private _validateNumberAddition(): boolean {
        const type = this.model.validationType;
        const VALIDATION_TYPES = NumberAdditionPkg.VALIDATION_TYPES;
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
        const cards = this.$el.find(".top-section .number-holder");
        for (const card of cards) {
            if (!card.classList.contains("slide")) {
                return false;
            }
        }
        return true;
    }

    private _validateCustom(): boolean {
        return window.BIL.CustomJS[this.model.validationFn](this, this.model);
    }

    private _showValidAnswer() {
        this._clearValidation();
        const type = this.model.validationType;
        const VALIDATION_TYPES = NumberAdditionPkg.VALIDATION_TYPES;
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
        const cards = this.$el.find(".top-section .number-holder");
        for (const card of cards) {
            card.classList.add("slide");
        }
    }

    private _showCustomAnswer() {
        window.BIL.CustomJS[this.model.showAnswerFn](this, this.model);
    }

    private slideCard(event: any) {
        this._triggerChangeEvent();
        const element = event.target;
        element.classList.add("slide");
    }
}
