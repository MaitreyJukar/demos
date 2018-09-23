import * as Backbone from "backbone";
import * as _ from "underscore";
import "../../css/number-line.styl";
import * as NumberLinePkg from "../models/number-line";

export interface ExtWindow extends Window {
    BIL: any;
}
declare const window: ExtWindow;

const numberLineTemplate: (attr?: any) => string = require("./../../tpl/number-line.hbs");
const pointTemplate: (attr?: any) => string = require("./../../tpl/points.hbs");

export class NumberLine extends Backbone.View<NumberLinePkg.NumberLine> {
    private _pointCount = 0;
    private _linePadding = 50;  // start and end tick padding
    constructor(attr?: Backbone.ViewOptions<NumberLinePkg.NumberLine>) {
        super(attr);
        this.render();
    }

    public events(): Backbone.EventsHash {
        return {
            "click .center-line": this.addPointOnLine,
            "click .student-placed": this.removePoint,
            "click .tick-icon": this.addPointOnTick,
            "click .tick-value": this.addPointOnTick
        };
    }

    public render(): NumberLine {
        this.$el.html(numberLineTemplate(this._getTemplateData()));
        if (this.model.placedPoints) {
            this._addAlreadyPlacedPoints();
        }
        if (this.model.savedData) {
            this._addFetchedPoints();
        }
        return this;
    }

    public addPointOnTick(event: any) {
        if (this._pointCount < this.model.maxPoints && this.model.pointPlotType === "tick") {
            this._triggerChange();
            this._pointCount++;
            const parentEle = this.$(event.target).closest(".tick")[0];
            this.appendPoint({
                class: "student-placed",
                color: this.model.newPointColor,
                label: this.model.label,
                left: parentEle.dataset.left,
                pointValue: parentEle.dataset.value
            });
        }
    }
    public addPointOnLine(event: any) {
        if (this._pointCount < this.model.maxPoints && this.model.pointPlotType === "line") {
            this._triggerChange();
            this._pointCount++;
            this.appendPoint({
                class: "student-placed",
                color: this.model.newPointColor,
                label: this.model.label,
                left: event.offsetX + "px",
                pointValue: this.getValueFromLeft(event.offsetX)
            });
        }
    }

    public removePoint(event: any) {
        this._pointCount--;
        this.$(event.target).closest(".point")[0].remove();
    }
    public appendPoint(pointData: any) {
        this.$el.find(".points-container").append(pointTemplate(pointData));
    }

    public validate(): boolean {
        const flag = this._validateNumberLine();
        const validationClass = flag ? "correct" : "incorrect";
        this._addValidation(validationClass);
        if (flag) {
            this._saveData();
        }
        return flag;
    }

    public enable() {
        this._clearValidation();
        this._clearUserResponse();
        this.$(".number-line-container").removeClass("disabled");
    }

    public disable() {
        this.$(".number-line-container").addClass("disabled");
    }

    public showAnswer() {
        this._showValidAnswer();
        this.$(".number-line-container").addClass("answer-shown");
        this._saveData();
    }

    public clearValidation() {
        // Functions to be called on clicking try again
    }

    public finish() {
        // Functions to be called on clicking next or continue
    }

    private _clearUserResponse() {
        this._pointCount = 0;
        this.$(".student-placed").remove();
    }
    private _triggerChange() {
        this.trigger("changed");
    }

    private _addAlreadyPlacedPoints() {
        for (const point of this.model.placedPoints) {
            const left = this._getLeftFromValue(point.pointValue);
            point.left = left;
            point.class = "default-placed";
            this.appendPoint(point);
        }
    }

    private _addFetchedPoints() {
        if (this.model.savedData.data) {
            for (const point of this.model.savedData.data) {
                const left = this._getLeftFromValue(point.pointValue);
                point.left = left;
                point.class = "default-placed";
                this.appendPoint(point);
            }
        }
    }

    private _getLeftFromValue(value: number) {
        const valueRelated = value - this.model.startPoint;
        const numerator = this.model.width - (this._linePadding * 2);
        const denominator = this.model.endPoint - this.model.startPoint;
        return this._linePadding + (numerator / denominator * valueRelated) + "px";
    }
    private getValueFromLeft(value: number) {
        const relatedLeft = value - this._linePadding;
        const denominator = this.model.width - (this._linePadding * 2);
        const numerator = this.model.endPoint - this.model.startPoint;
        return this.model.startPoint + (numerator / denominator * relatedLeft);
    }

    private _getTemplateData() {
        const className = this.model.pointPlotType === "line" ? "point-on-line" : "point-on-tick";
        return {
            class: className,
            ticks: this._getTicksData(),
            width: this.model.width + "px"

        };
    }

    private _getTicksData() {
        const ticks: any[] = [];
        let currentTick = this.model.startPoint;
        const totalTicks = this._getTotalTickCount();
        const leftShift = (this.model.width - (this._linePadding * 2)) / (totalTicks - 1);
        let left = 50;
        let i = 0;
        while (currentTick <= this.model.endPoint) {
            const tickData = {
                left: left + "px",
                tickData: this.model.ticks[i],
                value: currentTick
            };
            i++;
            ticks.push(tickData);
            currentTick += this.model.tickRange;
            currentTick = +currentTick.toFixed(10);
            left += leftShift;
        }
        return ticks;
    }

    private _getTotalTickCount() {
        return ((this.model.endPoint - this.model.startPoint) / this.model.tickRange) + 1;
    }

    private _addValidation(validation: string) {
        this._clearValidation();
        this.$(".number-line-container").addClass(validation);
    }

    private _clearValidation() {
        this.$(".number-line-container").removeClass("correct incorrect");
    }

    private _saveData() {
        const data = this._generateDataToBeSaved();
        this.trigger("save-data", data);
    }

    private _generateDataToBeSaved() {
        const type = this.model.saveDataType;
        const SAVE_DATA_TYPES = NumberLinePkg.SAVE_DATA_TYPES;
        switch (type) {
            case SAVE_DATA_TYPES.CUSTOM:
                return this._generateSaveDataForCustom();
            case SAVE_DATA_TYPES.BASIC:
                return this._generateSaveDataForBasic();
            case SAVE_DATA_TYPES.LRN:
                return this._generateSaveDataForLernosity();
            default:
                return;
        }
    }
    private _generateSaveDataForBasic() {
        const data = {
            data: this._getDataToSave(),
            type: NumberLinePkg.SAVE_DATA_TYPES.BASIC
        };
        return data;
    }
    private _generateSaveDataForLernosity() {
        const answers: any[] = [];
        const data = {
            answers,
            type: NumberLinePkg.SAVE_DATA_TYPES.LRN
        };
        const points = this.$(".student-placed");
        for (const point of this.model.savedData.data) {
            answers.push(point.pointValue);
        }
        for (const point of points) {
            answers.push(point.dataset.value);
        }
        return data;
    }
    private _getDataToSave() {
        const points = this.$(".student-placed");
        // TODO: Verify if this needs to be done
        if (this.model.savedData) {
            const data = this.model.savedData.data || [];
            for (const point of points) {
                const pointData = {
                    color: this.model.newPointColor,
                    label: this.model.label,
                    pointValue: point.dataset.value
                };
                data.push(pointData);
            }
            return data;
        }
        return [];
    }
    private _generateSaveDataForCustom() {
        const data = {
            data: this._getCustomDataToSave(),
            type: NumberLinePkg.SAVE_DATA_TYPES.CUSTOM
        };
        return data;
    }

    private _getCustomDataToSave() {
        if (window.BIL.CustomJS) {
            return window.BIL.CustomJS[this.model.saveDataFn](this.model, this);
        }
        return {};
    }

    private _validateNumberLine(): boolean {
        const type = this.model.validationType;
        const VALIDATION_TYPES = NumberLinePkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.GREATERTHAN:
                return this._validateGreaterThanAnswer();
            case VALIDATION_TYPES.EQUAL:
                return this._validateEqualAnswer();
            case VALIDATION_TYPES.LESSTHAN:
                return this._validateLessThanAnswer();
            case VALIDATION_TYPES.BETWEEN:
                return this._validateBetweenAnswer();
            default:
                return true;
        }
    }

    private _validateGreaterThanAnswer(): boolean {
        const points = this.$(".student-placed");
        if (points.length === 0) {
            return false;
        }
        for (const point of points) {
            if (point.dataset.value <= this.model.validationData.value[0]) {
                return false;
            }
        }
        return true;
    }
    private _validateEqualAnswer(): boolean {
        const points = this.$(".student-placed");
        if (points.length === 0) {
            return false;
        }
        for (const point of points) {
            if (parseFloat(point.dataset.value) != this.model.validationData.value) {
                return false;
            }
        }
        return true;
    }
    private _validateLessThanAnswer(): boolean {
        const points = this.$(".student-placed");
        if (points.length === 0) {
            return false;
        }
        for (const point of points) {
            if (point.dataset.value >= this.model.validationData.value[0]) {
                return false;
            }
        }
        return true;
    }
    private _validateBetweenAnswer(): boolean {
        const points = this.$(".student-placed");
        if (points.length === 0) {
            return false;
        }
        for (const point of points) {
            if (point.dataset.value <= this.model.validationData.value[0] || point.dataset.value >= this.model.validationData.value[1]) {
                return false;
            }
        }
        return true;
    }

    private _showValidAnswer() {
        this._clearValidation();
        const type = this.model.validationType;
        const VALIDATION_TYPES = NumberLinePkg.VALIDATION_TYPES;
        switch (type) {
            case VALIDATION_TYPES.LESSTHAN:
                this._showAnswer();
                break;
            case VALIDATION_TYPES.EQUAL:
                this._showAnswer();
                break;
            case VALIDATION_TYPES.GREATERTHAN:
                this._showAnswer();
                break;
            case VALIDATION_TYPES.BETWEEN:
                this._showAnswer();
                break;
            default:
        }
    }

    private _showAnswer() {
        this.$(".student-placed").remove();
        this.appendPoint({
            class: "student-placed",
            color: this.model.newPointColor,
            label: this.model.label,
            left: this._getLeftFromValue(this.model.validationData.showCorrectValue),
            pointValue: this.model.validationData.showCorrectValue
        });
    }
}
