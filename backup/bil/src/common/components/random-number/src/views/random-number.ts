import * as Backbone from "backbone";
import * as _ from "underscore";
import CommonUtilities = Utilities;
import { RandomNumberGenerator, Types } from "../models/random-number";
import { RandomNumberButton } from "../views/button";
import { RandomNumberChit } from "../views/chit";
import { RandomNumberDice } from "../views/dice";
import * as Utilities from "./../../../../helper/utilities";

import "../../css/box.styl";
import "../../css/random-number.styl";

export enum ViewToFileMap {
    Button = "button",
    Dice = "dice",
    Chit = "chit"
}

const randomNumberTemplate: (attr?: any) => string = require("./../../tpl/random-number.hbs");

export class RandomNumber extends Backbone.View<RandomNumberGenerator> {

    public childView: any;
    private _randomTableLogIndex = 1;

    constructor(attr?: Backbone.ViewOptions<RandomNumberGenerator>) {
        super(attr);
        this.render();
        this.listenTo(this.model, "change:buttonText", () => {
            this.$(".generate-random").html(this.model.buttonText);
        });
        this.renderType();
        this.adjustTableStyle();
    }

    public events(): Backbone.EventsHash {
        return {
            "click .generate-random": "generateRandomNumber"
        };
    }

    public render(): RandomNumber {
        this.$el.append(randomNumberTemplate(this.model.toJSON()));
        return this;
    }

    public renderType() {
        const subType = this.model.randomNumberAttributes.subType;
        const type = ViewToFileMap[subType];
        CommonUtilities.Utilities.logger.info(type);

        switch (type) {
            case "dice":
                this.childView = new RandomNumberDice({
                    el: this.$(".random-type-container"),
                    model: this.model
                });
                this.model.type = Types.Dice;
                break;
            case "chit":
                this.childView = new RandomNumberChit({
                    el: this.$(".random-type-container"),
                    model: this.model
                });
                this.model.type = Types.Chit;
                break;
            case "button":
            default:
                this.childView = new RandomNumberButton({
                    el: this.$(".random-type-container"),
                    model: this.model
                });
                this.model.type = Types.Button;

        }

        if (this.model.type == Types.Button && this.model.showDefault) {
            this.setDefaultValues();
            this.childView.setDefaultValues();
        }
    }

    public adjustTableStyle(): void {
        if (this.model.count == 10 && this.model.type == Types.Chit) {
            this.$(".random-numbers-log").addClass("align-left");
        } else if (this.model.type == Types.Dice && this.model.incremental) {
            this.$(".random-numbers-log").addClass("align-center");
        } else {
            if (this.model.times !== void 0) {
                this.$(".random-numbers-log").addClass("align-left");
            } else {
                this.$(".random-numbers-log").addClass("align-center");
            }
        }
    }

    public generateRandomNumber(): void {
        this.model.randomNumber();
        this.disable();
        this.childView.setRandomNumber().then(this.fillLogTable.bind(this));
        // this.fillLogTable();
    }

    public setDefaultValues(): void {
        const $tableRow = this.$(".random-numbers-log table tbody tr");
        if (this.model.type == Types.Button) {
            $tableRow.eq(this._randomTableLogIndex - 1).find("td").eq(0).html(CommonUtilities.Utilities.getLocText(
                this.model.currentLanguage, this.model.randomNumberAttributes.subType.toLowerCase(), "label") +
                this._randomTableLogIndex);
            $tableRow.eq(this._randomTableLogIndex - 1).find("td").eq(1).html("( " + this.model.defaultValues.join(", ") + " )");
            this._randomTableLogIndex++;
        }
    }

    public fillLogTable(data: any) {
        const $tableRow = this.$(".random-numbers-log table tbody tr");
        const label = (this.model.label) ? this.model.label + " " : CommonUtilities.Utilities.getLocText(
            this.model.currentLanguage, this.model.randomNumberAttributes.subType.toLowerCase(), "label");
        if (this.model.count == 10 && this.model.type == Types.Chit) {
            setTimeout(() => {
                this.$(".random-numbers-log").addClass("random-numbers-log-chit");
                const cg = this.model.rangeArr.slice(0, 10);
                const tg = this.model.rangeArr.slice(10);
                if (this._randomTableLogIndex >= (this.model.displayCount + 1)) {
                    this.$(".random-numbers-log table tbody").append("<tr><td>" + label +
                        this._randomTableLogIndex++ + "</td><td>" + "CG: " + cg.join(", ") +
                        "<br>" + "TG: " + tg.join(", ") + "</td></tr>");
                } else {
                    $tableRow.eq(this._randomTableLogIndex - 1).find("td").eq(0).html(CommonUtilities.Utilities.getLocText(
                        this.model.currentLanguage, this.model.randomNumberAttributes.subType.toLowerCase(), "label") +
                        this._randomTableLogIndex);
                    $tableRow.eq(this._randomTableLogIndex - 1).find("td").eq(1).html("CG: " + cg.join(", ") +
                        "<br>" + "TG: " + tg.join(", "));
                    this._randomTableLogIndex++;
                }
                if (this._randomTableLogIndex >= this.model.displayCount) {
                    CommonUtilities.Utilities.smoothScrollTo(this.$(".random-numbers-log"), this.model.displayCount);
                }
            }, 600);
        } else if (this.model.type == Types.Dice && this.model.incremental) {
            const currentStep = this.model.increments[this._randomTableLogIndex - 1];
            const row1Value = label + currentStep;
            const row2Value = "" + this.getRandomNumberWithTolerance(currentStep, this.model.factor, this.model.tolerance) +
                CommonUtilities.Utilities.getLocText(
                    this.model.currentLanguage, this.model.randomNumberAttributes.subType.toLowerCase(), "times");
            if (this._randomTableLogIndex >= (this.model.displayCount + 1)) {
                this.$(".random-numbers-log table tbody").append("<tr><td>" + row1Value + "</td><td>" + row2Value + "</td></tr>");
                CommonUtilities.Utilities.smoothScrollTo(this.$(".random-numbers-log"), this.model.displayCount);
            } else {
                $tableRow.eq(this._randomTableLogIndex - 1).find("td").eq(0).html(row1Value);
                $tableRow.eq(this._randomTableLogIndex - 1).find("td").eq(1).html(row2Value);
            }
            this._randomTableLogIndex++;
        } else {
            if (this._randomTableLogIndex >= (this.model.displayCount + 1)) {
                this.$(".random-numbers-log table tbody").append("<tr><td>" + label +
                    this._randomTableLogIndex++ + "</td><td> ( " + this.model.randomNumberArray.join(", ") + " ) </td></tr>");
                CommonUtilities.Utilities.smoothScrollTo(this.$(".random-numbers-log"), this.model.displayCount);
            } else {
                $tableRow.eq(this._randomTableLogIndex - 1).find("td").eq(0).html(label +
                    this._randomTableLogIndex);
                $tableRow.eq(this._randomTableLogIndex - 1).find("td").eq(1).html("( " + this.model.randomNumberArray.join(", ") + " )");
                this._randomTableLogIndex++;
            }

            if (this.model.type == Types.Dice && this.model.times && this._randomTableLogIndex >= this.model.displayCount) {
                CommonUtilities.Utilities.smoothScrollTo(this.$(".random-numbers-log"), this.model.displayCount);
            } else if (this._randomTableLogIndex >= (this.model.displayCount + 1)) {
                CommonUtilities.Utilities.smoothScrollTo(this.$(".random-numbers-log"), this.model.displayCount);
            }
        }
        if (this._randomTableLogIndex > this.model.limit) {
            this.disable();
        } else {
            this.enable();
        }
        return data;
    }

    public getRandomNumberWithTolerance(increment: number, factor: number, tolerance: number = 2): number {
        const value = Math.round(increment / factor);
        const max = value + tolerance;
        const min = value - tolerance;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public enable() {
        CommonUtilities.Utilities.enableBtn(this.$(".generate-random") as JQuery<HTMLButtonElement>);
        if (this.childView.enable === "function") {
            this.childView.enable();
        }
    }

    public disable() {
        CommonUtilities.Utilities.disableBtn(this.$(".generate-random") as JQuery<HTMLButtonElement>);
        if (this.childView.disable === "function") {
            this.childView.disable();
        }
    }

    public setButtonText() {
        this.$(".generate-random.controlBtn").html(this.model.buttonText);
    }

}
