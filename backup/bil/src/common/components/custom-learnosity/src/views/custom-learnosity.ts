import * as Backbone from "backbone";
import * as Handlebars from "handlebars";

// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jqueryui";
// tslint:disable-next-line:no-import-side-effect ordered-imports
import "jquery-ui-touch-punch";

import * as KeypadModel from "../../../keypad/src/models/keypad";
import * as KeypadView from "../../../keypad/src/views/keypad";
import "../../css/custom-learnosity.styl";
import * as CustomLearnosityPkg from "../models/custom-learnosity";

export interface ExtWindow extends Window {
    BIL: any;
}
declare const window: ExtWindow;

declare type HandlebarsTpl = (attr?: { [x: string]: any }) => string;
const customLearnosityTemplate: (
    attr?: any
) => string = require("./../../tpl/custom-learnosity.hbs");
const partialTemplates: { [x: string]: HandlebarsTpl } = {
    input: require("./../../tpl/input.hbs") as HandlebarsTpl
};

export class CustomLearnosity extends Backbone.View<CustomLearnosityPkg.CustomLearnosity> {
    public $currentInputField: any;
    private customKeypadModel: KeypadModel.Keypad;
    private customKeypadView: KeypadView.Keypad;

    constructor(
        attr?: Backbone.ViewOptions<CustomLearnosityPkg.CustomLearnosity>
    ) {
        super(attr);
        this._registerHelpers();
        this.render();
        this._initializeKeypad();
    }

    public events(): Backbone.EventsHash {
        return {
            "change .cl-input": this._onInputChange.bind(this),
            "focusin .cl-input": this.showHideKeypad.bind(this, true),
            "keypress .cl-input": this._onInputChange.bind(this)
        };
    }

    public render(): CustomLearnosity {
        this.$el.html(customLearnosityTemplate(this._getTemplateOptions()));
        return this;
    }

    public validate(): boolean {
        const flag = this._validateCustomLearnosity();
        const validationClass = flag ? "lrn_correct" : "lrn_incorrect";
        this._addValidation(validationClass);
        if (flag) {
            this._saveData();
            this.disable();
            this.model.correct = true;
        }
        return flag;
    }

    public enable() {
        this.$(".custom-learnosity-item").removeClass("disabled");
        this.$(".cl-input").prop("disabled", false);
    }

    public disable() {
        this.$(".custom-learnosity-item").addClass("disabled");
        this.$(".cl-input").prop("disabled", true);
    }

    public showAnswer() {
        if (!this.model.correct) {
            this._showValidAnswer();
            this.$(".custom-learnosity-item").addClass("answer-shown");
        }
    }

    public clearValidation() {
        this._clearValidation();
        this.$(".custom_lrn_response").removeClass("lrn_correct lrn_incorrect");
    }

    public showHideKeypad(isHide: boolean, event: any) {
        if (isHide === true) {
            if (!!this.$currentInputField === false) {
                this.customKeypadView.showKeypad(isHide);
                this.$currentInputField = $(event.currentTarget);
                $(document).on("click.keypad", this.clickOnDocument.bind(this));
                this.setKeypadPostion();
            } else {
                this.$currentInputField = $(event.currentTarget);
                if (this.keypadOverlaps()) {
                    this.setKeypadPostion();
                }
            }
            console.log("show bind document event");
        } else if (isHide === false && !!this.$currentInputField === true) {
            this.customKeypadView.showKeypad(isHide);
            this.$currentInputField = null;
            console.log("hide off document event");
            $(document).off("click.keypad", this.clickOnDocument);
        }
    }

    public setKeypadPostion() {
        const $parentElement = this.customKeypadView.getParentElement();
        const parentElementWidth = $parentElement.width();
        const parentElementHeight = $parentElement.height();
        const parentElemOffset = $parentElement.offset();

        const inputElemOffset = this.$currentInputField.offset();

        const inputElemWidth = this.$currentInputField.outerWidth();
        const inputElemHeight = this.$currentInputField.outerHeight();

        const calWidth = this.customKeypadView.$el.find(".lrn-formula-keyboard").outerWidth();
        const calHeight = this.customKeypadView.$el.find(".lrn-formula-keyboard").outerHeight();
        let calOffsetTop = 0;
        let calOffsetLeft = 0;

        calOffsetLeft = inputElemOffset.left + inputElemWidth + calWidth > parentElementWidth + parentElemOffset.left ?
            inputElemOffset.left - calWidth : inputElemOffset.left + inputElemWidth;
        if (calOffsetLeft < 0) {
            calOffsetLeft = 0;
        }

        calOffsetTop = inputElemOffset.top + inputElemHeight + calHeight > parentElementHeight + parentElemOffset.top ?
            inputElemOffset.top - calHeight : inputElemOffset.top + inputElemHeight;

        if (calOffsetTop < 0) {
            calOffsetTop = 0;
        }
        this.customKeypadView.setOffset(calOffsetLeft, calOffsetTop);
    }

    public keypadOverlaps() {
        return this.overlaps(this.$currentInputField, this.customKeypadView.$el.find(".custom-keypad-container"));
    }

    public getPositions($elem: JQuery<HTMLElement>) {
        const rect = $elem[0].getBoundingClientRect();
        return [
            [rect.left, rect.left + rect.width],
            [rect.top, rect.top + rect.height]
        ];
    }

    public comparePositions(pos1: number[], pos2: number[]) {
        const r1 = pos1[0] < pos2[0] ? pos1 : pos2;
        const r2 = pos1[0] < pos2[0] ? pos2 : pos1;
        return r1[1] > r2[0] || r1[0] === r2[0];
    }

    public overlaps($elem1: JQuery<HTMLElement>, $elem2: JQuery<HTMLElement>) {
        const pos1 = this.getPositions($elem1);
        const pos2 = this.getPositions($elem2);
        return this.comparePositions(pos1[0], pos2[0]) && this.comparePositions(pos1[1], pos2[1]);
    }

    public clickOnDocument(event: any) {
        const $target = $(event.target);
        const liesInSameEl = $.contains(this.$el[0], event.target);
        if (!liesInSameEl || (!$target.hasClass("cl-input") &&
            $target.parents(".custom-keypad").length === 0 &&
            !!this.$currentInputField === true)) {
            this.showHideKeypad(false, event);
        }
    }

    private _registerHelpers() {
        Handlebars.registerHelper("add", this._add);
    }

    private _add(a: number, b: number) {
        return a + b;
    }

    private _getTemplateOptions() {
        return {
            answers: this._getAnswers(),
            question: this.model.question,
            replaceAnswers: this.model.replaceAnswers,
            response: this._getResponseTemplate()
        };
    }

    private keypadButtonPressed(keypadValue: string) {
        const $currInputField = this.$currentInputField;
        const currCursorPos = $currInputField[0].selectionStart;
        const currVal = $currInputField.val();
        let strLength = currVal.length;

        switch (keypadValue) {
            case "Left":
                this.setCursorPosition(
                    $currInputField,
                    currCursorPos === 0 ? 0 : currCursorPos - 1,
                    currCursorPos === 0 ? 0 : currCursorPos - 1
                );
                break;
            case "Right":
                this.setCursorPosition(
                    $currInputField,
                    currCursorPos + 1,
                    currCursorPos + 1
                );
                break;
            case "Backspace":
                if (currCursorPos < strLength) {
                    $currInputField.val(
                        [
                            currVal.slice(0, currCursorPos === 0 ? 0 : currCursorPos - 1),
                            currVal.slice(currCursorPos)
                        ].join("")
                    );
                    strLength = currCursorPos === 0 ? 0 : currCursorPos - 1;
                } else {
                    $currInputField.val(currVal.slice(0, strLength - 1));
                    strLength = strLength - 1;
                }
                this.setCursorPosition($currInputField, strLength, strLength);
                this._triggerChangeEvent();
                break;
            default:
                if (currCursorPos < strLength) {
                    $currInputField.val(
                        [
                            currVal.slice(0, currCursorPos),
                            keypadValue,
                            currVal.slice(currCursorPos)
                        ].join("")
                    );
                    strLength = currCursorPos + 1;
                } else {
                    $currInputField.val($currInputField.val() + keypadValue);
                    strLength = strLength + 1;
                }
                this.setCursorPosition($currInputField, strLength, strLength);
                this._triggerChangeEvent();
        }
    }

    private setCursorPosition(
        $currInputField: any,
        strStart: number,
        strEnd: number
    ) {
        $currInputField.focus();
        $currInputField[0].setSelectionRange(strStart, strEnd);
    }

    private _getAnswers() {
        const responseKeys = Object.keys(this.model.responseTypes);
        const answers: any[] = [];
        responseKeys.forEach((ansID) => {
            answers.push({
                ansID
            });
        });
        return answers;
    }

    private _getResponseTemplate(): string {
        let response = this.model.response;
        const RESPONSE_FINDER = /\{{2}(response\d+)\}{2}/g;
        const textIDs = response.match(RESPONSE_FINDER);
        if (textIDs) {
            for (const responseItem of textIDs) {
                const ID = responseItem.replace(RESPONSE_FINDER, "$1");
                response = response
                    .split(responseItem)
                    .join(this._getItemTemplate(this.model.responseTypes[ID]));
            }
        }
        return response;
    }

    private _getItemTemplate(response: CustomLearnosityPkg.Response): string {
        response.isTouchDevice = "ontouchstart" in window;
        return partialTemplates[response.type](response).trim();
    }

    private _onInputChange(evt: JQueryEventObject) {
        this._triggerChangeEvent();
    }

    private _fetchUserResponses() {
        const responses = this.model.responseTypes;
        const userResponses = {};
        for (const responseID in responses) {
            if (responseID) {
                userResponses[responseID] = this.$(`[respid=${responseID}] .cl-input`).val().toString();
            }
        }
        return userResponses;
    }

    private _validateCustomLearnosity(): boolean {
        const type = this.model.validationType;
        const VALIDATION_TYPES = CustomLearnosityPkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.BASIC:
                return this._validateBasic();
            case VALIDATION_TYPES.CUSTOM:
                return this._validateCustom();
            default:
                return true;
        }
    }

    private _validateBasic(): boolean {
        return this._validateResponses();
    }

    private _validateCustom(): boolean {
        if (window.BIL.CustomJS && window.BIL.CustomJS[this.model.validationFn]) {
            const validatedResponses = window.BIL.CustomJS[this.model.validationFn](this._fetchUserResponses(), this, this.model);
            let isValid = true;
            for (const responseID in validatedResponses) {
                if (validatedResponses[responseID] != null) {
                    this._applyValidationClasses(responseID, validatedResponses[responseID]);
                    isValid = isValid && validatedResponses[responseID];
                }
            }
            return isValid;
        }
        return false;
    }

    private _validateResponses(): boolean {
        let isValid = true;
        const responses = this.model.responseTypes;
        for (const responseID in responses) {
            if (responses[responseID]) {
                const isResponseValid = this._isValidResponse(responses[responseID]);
                isValid = isValid && isResponseValid;
                this._applyValidationClasses(responseID, isResponseValid);
            }
        }
        return isValid;
    }

    private _isValidResponse(response: CustomLearnosityPkg.Response): boolean {
        switch (response.type) {
            case "input":
                return this._isInputValid(response);
            default:
                return true;
        }
    }

    private _isInputValid(response: CustomLearnosityPkg.Response): boolean {
        if (response.validation.type === "exactMatch") {
            const userVal = this.$(`[respid=${response.respID}] .cl-input`)
                .val()
                .toString();
            return userVal === response.validation.value.toString();
        }
        return false;
    }

    private _applyValidationClasses(
        response: string,
        correct: boolean
    ) {
        const $responseWrapper = this.$(`[respid=${response}]`);
        const $answer = this.$(`[ansid=${response}]`);
        $responseWrapper.removeClass("lrn_correct lrn_incorrect");
        $answer.removeClass("ans-correct ans-incorrect");
        if (correct) {
            $responseWrapper.addClass("lrn_correct");
            $answer.addClass("answer-correct");
        } else {
            $responseWrapper.addClass("lrn_incorrect");
            $answer.addClass("answer-incorrect");
        }
    }

    private _showValidAnswer() {
        this._clearValidation();
        const type = this.model.validationType;
        const VALIDATION_TYPES = CustomLearnosityPkg.VALIDATION_TYPES;
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
        this._fillCorrectAnswers();
        this._showCorrectAnswers();
    }

    private _showCustomAnswer() {
        if (window.BIL.CustomJS && window.BIL.CustomJS[this.model.showAnswerFn]) {
            const validResponses = window.BIL.CustomJS[this.model.showAnswerFn](this, this.model);
            const responses = this.model.responseTypes;
            for (const responseID in responses) {
                if (responses[responseID]) {
                    this.$(`[ansid=${responseID}] .lrn_responseText`).html(
                        validResponses[responseID]
                    );
                }
            }
        }
        this._showCorrectAnswers();
    }

    private _fillCorrectAnswers() {
        const responses = this.model.responseTypes;
        for (const responseID in responses) {
            if (responses[responseID]) {
                this.$(`[ansid=${responseID}] .lrn_responseText`).html(
                    responses[responseID].validation.value
                );
            }
        }
        return;
    }

    private _showCorrectAnswers() {
        if (this.model.replaceAnswers) {
            this.clearValidation();
            this.$(".lrn_cloze_response_container .custom-answer").removeClass(
                "lrn_hide"
            );
            this.$(".lrn_cloze_response_container .cl-input").hide();
        } else {
            this.$(".lrn_correctAnswers").removeClass("lrn_hide");
        }
    }

    private _addValidation(validation: string) {
        this._clearValidation();
        this.$(".custom-learnosity-item").addClass(validation);
    }

    private _clearValidation() {
        const $lrnItem = this.$(".custom-learnosity-item");
        $lrnItem.removeClass("lrn_correct lrn_incorrect");
    }

    private _triggerChangeEvent() {
        this._clearValidation();
        this.$(".custom_lrn_response").removeClass("lrn_correct lrn_incorrect");
        this.trigger("changed");
    }

    private _saveData() {
        const data = this._generateDataToBeSaved();
        this.trigger("save-data", data);
    }

    private _generateDataToBeSaved() {
        const type = this.model.saveDataType;
        const SAVE_DATA_TYPES = CustomLearnosityPkg.SAVE_DATA_TYPES;
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
            type: CustomLearnosityPkg.SAVE_DATA_TYPES.CUSTOM
        };
        return data;
    }

    private _getCustomDataToSave() {
        if (window.BIL.CustomJS) {
            return window.BIL.CustomJS[this.model.saveDataFn](this.model, this);
        }
        return {};
    }

    private _initializeKeypad() {
        this.customKeypadModel = new KeypadModel.Keypad({});
        this.customKeypadView = new KeypadView.Keypad({
            el: this.$(".custom-keypad"),
            model: this.customKeypadModel
        });
        this.customKeypadView.listenTo(
            this.customKeypadView,
            "keypad-button-pressed",
            this.keypadButtonPressed.bind(this)
        );
    }
}
